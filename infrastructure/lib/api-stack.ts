import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

interface ApiStackProps extends cdk.StackProps {
  userPool?: cognito.UserPool;
}

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: ApiStackProps) {
    super(scope, id, props);

    // DynamoDB table for storing coverage data
    const table = new dynamodb.Table(this, 'AiDlcTable', {
      partitionKey: { name: 'cell_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production
      timeToLiveAttribute: 'ttl', // For implementing 3-month rolling window
    });

    // Add GSI for location-based queries
    table.addGlobalSecondaryIndex({
      indexName: 'location-index',
      partitionKey: { name: 'grid_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'signal_strength', type: dynamodb.AttributeType.NUMBER },
      projectionType: dynamodb.ProjectionType.ALL
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

    // Create an API Gateway REST API with Cognito Authorizer
    const api = new apigateway.RestApi(this, 'AiDlcApi', {
      restApiName: 'AI DLC Service',
      description: 'API for AI/DLC management',
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
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'GeoCellAuthorizer', {
      cognitoUserPools: [props?.userPool || new cognito.UserPool(this, 'DefaultUserPool', {
        userPoolName: 'default-user-pool',
        selfSignUpEnabled: false
      })]
    });

    // Default authorization settings
    const defaultAuthorization: apigateway.MethodOptions = {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO
    };

    // Create protected API Gateway resources
    const items = api.root.addResource('items');
    items.addMethod('GET', new apigateway.LambdaIntegration(apiHandler), defaultAuthorization);
    items.addMethod('POST', new apigateway.LambdaIntegration(apiHandler), defaultAuthorization);

    // Add protected individual item resource
    const item = items.addResource('{id}');
    item.addMethod('GET', new apigateway.LambdaIntegration(apiHandler), defaultAuthorization);
    item.addMethod('PUT', new apigateway.LambdaIntegration(apiHandler), defaultAuthorization);
    item.addMethod('DELETE', new apigateway.LambdaIntegration(apiHandler), defaultAuthorization);

    // Output the API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL',
    });
  }
}
