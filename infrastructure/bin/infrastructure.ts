#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ApiStack } from '../lib/api-stack';
import { AuthStack } from '../lib/auth-stack';

const app = new cdk.App();

// Deploy Authentication Stack
const authStack = new AuthStack(app, 'GeoCellAuthStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
});

// Deploy API Stack with Auth integration
new ApiStack(app, 'GeoCellApiStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
  userPool: authStack.userPool // Pass the UserPool to ApiStack
});
