import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as autoscaling from 'aws-cdk-lib/aws-applicationautoscaling';
import { Construct } from 'constructs';

interface ProcessingStackProps extends cdk.StackProps {
  ingestionQueue: sqs.Queue;
  retryQueue: sqs.Queue;
  deadLetterQueue: sqs.Queue;
}

export class ProcessingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ProcessingStackProps) {
    super(scope, id, props);

    // Create VPC for ECS cluster
    const vpc = new ec2.Vpc(this, 'ProcessingVPC', {
      maxAzs: 2,
      natGateways: 1
    });

    // Create ECS Cluster
    const cluster = new ecs.Cluster(this, 'ProcessingCluster', {
      vpc,
      containerInsights: true
    });

    // Create Task Role
    const taskRole = new iam.Role(this, 'ProcessingTaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      description: 'Role for processing tasks'
    });

    // Add permissions to task role
    taskRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'sqs:ReceiveMessage',
        'sqs:DeleteMessage',
        'sqs:GetQueueAttributes',
        'sqs:ChangeMessageVisibility'
      ],
      resources: [
        props.ingestionQueue.queueArn,
        props.retryQueue.queueArn,
        props.deadLetterQueue.queueArn
      ]
    }));

    // Create Log Group
    const logGroup = new logs.LogGroup(this, 'ProcessingLogGroup', {
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // Create Task Definition
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'ProcessingTaskDef', {
      memoryLimitMiB: 2048,
      cpu: 1024,
      taskRole
    });

    // Add Container to Task Definition
    const container = taskDefinition.addContainer('ProcessingContainer', {
      image: ecs.ContainerImage.fromAsset('src/processing'),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'processing',
        logGroup
      }),
      environment: {
        INGESTION_QUEUE_URL: props.ingestionQueue.queueUrl,
        RETRY_QUEUE_URL: props.retryQueue.queueUrl,
        DLQ_URL: props.deadLetterQueue.queueUrl,
        BATCH_SIZE: '10',
        PROCESSING_TIMEOUT: '300'
      }
    });

    // Create ECS Service
    const service = new ecs.FargateService(this, 'ProcessingService', {
      cluster,
      taskDefinition,
      desiredCount: 2,
      minHealthyPercent: 50,
      maxHealthyPercent: 200,
      assignPublicIp: false,
      enableExecuteCommand: true
    });

    // Set up Auto Scaling
    const scaling = service.autoScaleTaskCount({
      minCapacity: 2,
      maxCapacity: 10
    });

    // CPU utilization scaling
    scaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 70,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60)
    });

    // Queue-based scaling
    scaling.scaleOnMetric('QueueScaling', {
      metric: new cloudwatch.Metric({
        namespace: 'AWS/SQS',
        metricName: 'ApproximateNumberOfMessagesVisible',
        dimensionsMap: {
          QueueName: props.ingestionQueue.queueName
        },
        statistic: 'Average',
        period: cdk.Duration.seconds(300)
      }),
      scalingSteps: [
        { upper: 0, change: -1 },
        { lower: 100, change: +1 },
        { lower: 500, change: +2 }
      ],
      adjustmentType: autoscaling.AdjustmentType.CHANGE_IN_CAPACITY
    });

    // Add CloudWatch Dashboard
    const dashboard = new cloudwatch.Dashboard(this, 'ProcessingDashboard', {
      dashboardName: 'ProcessingMetrics'
    });

    dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'CPU Utilization',
        left: [service.metricCpuUtilization()]
      }),
      new cloudwatch.GraphWidget({
        title: 'Memory Utilization',
        left: [service.metricMemoryUtilization()]
      }),
      new cloudwatch.GraphWidget({
        title: 'Queue Metrics',
        left: [
          props.ingestionQueue.metricApproximateNumberOfMessagesVisible(),
          props.retryQueue.metricApproximateNumberOfMessagesVisible(),
          props.deadLetterQueue.metricApproximateNumberOfMessagesVisible()
        ]
      })
    );

    // Add CloudWatch Alarms
    new cloudwatch.Alarm(this, 'HighCpuAlarm', {
      metric: service.metricCpuUtilization(),
      threshold: 85,
      evaluationPeriods: 3,
      datapointsToAlarm: 2
    });

    new cloudwatch.Alarm(this, 'HighMemoryAlarm', {
      metric: service.metricMemoryUtilization(),
      threshold: 85,
      evaluationPeriods: 3,
      datapointsToAlarm: 2
    });

    new cloudwatch.Alarm(this, 'HighDLQMessagesAlarm', {
      metric: props.deadLetterQueue.metricApproximateNumberOfMessagesVisible(),
      threshold: 100,
      evaluationPeriods: 1
    });

    // Output values
    new cdk.CfnOutput(this, 'ClusterName', {
      value: cluster.clusterName,
      description: 'ECS Cluster Name'
    });

    new cdk.CfnOutput(this, 'ServiceName', {
      value: service.serviceName,
      description: 'ECS Service Name'
    });

    new cdk.CfnOutput(this, 'LogGroupName', {
      value: logGroup.logGroupName,
      description: 'CloudWatch Log Group Name'
    });
  }
}
