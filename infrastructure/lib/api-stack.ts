import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB table for storing AI/DLC data
    const table = new dynamodb.Table(this, 'AiDlcTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production
    });

    // Lambda function for API handlers
    const apiHandler = new lambda.Function(this, 'ApiHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('src/lambda'),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    // Grant the Lambda function read/write permissions to the table
    table.grantReadWriteData(apiHandler);

    // Create an API Gateway REST API
    const api = new apigateway.RestApi(this, 'AiDlcApi', {
      restApiName: 'AI DLC Service',
      description: 'API for AI/DLC management',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    // Create an API Gateway resource and method
    const items = api.root.addResource('items');
    items.addMethod('GET', new apigateway.LambdaIntegration(apiHandler));
    items.addMethod('POST', new apigateway.LambdaIntegration(apiHandler));

    // Add individual item resource
    const item = items.addResource('{id}');
    item.addMethod('GET', new apigateway.LambdaIntegration(apiHandler));
    item.addMethod('PUT', new apigateway.LambdaIntegration(apiHandler));
    item.addMethod('DELETE', new apigateway.LambdaIntegration(apiHandler));

    // Output the API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL',
    });
  }
}
