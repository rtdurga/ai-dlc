import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Construct } from 'constructs';

interface IngestionStackProps extends cdk.StackProps {
  userPool: cognito.UserPool;
  coverageTable: dynamodb.Table;
}

export class IngestionStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: IngestionStackProps) {
    super(scope, id, props);

    // Create SQS queues
    const ingestionQueue = new sqs.Queue(this, 'IngestionQueue', {
      visibilityTimeout: cdk.Duration.seconds(300),
      retentionPeriod: cdk.Duration.days(14)
    });

    const deadLetterQueue = new sqs.Queue(this, 'DeadLetterQueue', {
      retentionPeriod: cdk.Duration.days(14)
    });

    const retryQueue = new sqs.Queue(this, 'RetryQueue', {
      visibilityTimeout: cdk.Duration.seconds(300),
      retentionPeriod: cdk.Duration.days(14),
      deadLetterQueue: {
        queue: deadLetterQueue,
        maxReceiveCount: 3
      }
    });

    // Create DynamoDB table for ingestion status tracking
    const ingestionStatusTable = new dynamodb.Table(this, 'IngestionStatusTable', {
      partitionKey: { name: 'batch_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'record_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'ttl',
      removalPolicy: cdk.RemovalPolicy.DESTROY // Change for production
    });

    // Add GSI for status queries
    ingestionStatusTable.addGlobalSecondaryIndex({
      indexName: 'status-index',
      partitionKey: { name: 'status', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL
    });

    // Create Lambda for data validation
    const validationLambda = new lambda.Function(this, 'ValidationLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('src/lambda/validation'),
      environment: {
        INGESTION_QUEUE_URL: ingestionQueue.queueUrl,
        RETRY_QUEUE_URL: retryQueue.queueUrl,
        STATUS_TABLE_NAME: ingestionStatusTable.tableName,
        COVERAGE_TABLE_NAME: props.coverageTable.tableName
      },
      timeout: cdk.Duration.seconds(30)
    });

    // Create Lambda for data processing
    const processingLambda = new lambda.Function(this, 'ProcessingLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('src/lambda/processing'),
      environment: {
        STATUS_TABLE_NAME: ingestionStatusTable.tableName,
        COVERAGE_TABLE_NAME: props.coverageTable.tableName,
        RETRY_QUEUE_URL: retryQueue.queueUrl
      },
      timeout: cdk.Duration.seconds(60)
    });

    // Create Lambda for retry handling
    const retryLambda = new lambda.Function(this, 'RetryLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('src/lambda/retry'),
      environment: {
        INGESTION_QUEUE_URL: ingestionQueue.queueUrl,
        STATUS_TABLE_NAME: ingestionStatusTable.tableName
      },
      timeout: cdk.Duration.seconds(30)
    });

    // Add SQS event sources to Lambdas
    processingLambda.addEventSource(new SqsEventSource(ingestionQueue));
    retryLambda.addEventSource(new SqsEventSource(retryQueue));

    // Grant permissions
    ingestionQueue.grantSendMessages(validationLambda);
    retryQueue.grantSendMessages(validationLambda);
    retryQueue.grantSendMessages(processingLambda);
    ingestionQueue.grantSendMessages(retryLambda);
    
    ingestionStatusTable.grantReadWriteData(validationLambda);
    ingestionStatusTable.grantReadWriteData(processingLambda);
    ingestionStatusTable.grantReadWriteData(retryLambda);
    
    props.coverageTable.grantReadWriteData(processingLambda);

    // Create API Gateway for data ingestion
    const api = new apigateway.RestApi(this, 'IngestionApi', {
      restApiName: 'Data Ingestion Service',
      description: 'Service for ingesting coverage data',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token'
        ]
      }
    });

    // Add Cognito Authorizer
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'IngestionAuthorizer', {
      cognitoUserPools: [props.userPool]
    });

    // Create API resources and methods
    const ingest = api.root.addResource('ingest');
    ingest.addMethod('POST', 
      new apigateway.LambdaIntegration(validationLambda),
      {
        authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO
      }
    );

    const status = api.root.addResource('status');
    status.addMethod('GET',
      new apigateway.LambdaIntegration(validationLambda),
      {
        authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO
      }
    );

    // Add CloudWatch alarms and metrics
    // TODO: Add monitoring setup

    // Output values
    new cdk.CfnOutput(this, 'IngestionApiUrl', {
      value: api.url,
      description: 'Data Ingestion API URL'
    });

    new cdk.CfnOutput(this, 'DeadLetterQueueUrl', {
      value: deadLetterQueue.queueUrl,
      description: 'Dead Letter Queue URL for monitoring failed ingestions'
    });
  }
}
