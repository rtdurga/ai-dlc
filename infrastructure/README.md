# AI/DLC Infrastructure

This directory contains the AWS CDK infrastructure code for the AI/DLC project. The infrastructure includes:

- API Gateway for RESTful API endpoints
- Lambda functions for API handlers
- DynamoDB table for data storage

## Prerequisites

- Node.js 14.x or later
- AWS CLI configured with appropriate credentials
- AWS CDK CLI installed (`npm install -g aws-cdk`)

## Project Structure

```
infrastructure/
├── bin/                    # CDK app entry point
├── lib/                    # CDK stacks
├── src/                    # Source code
│   └── lambda/            # Lambda function code
├── cdk.json               # CDK configuration
├── package.json           # Project dependencies
└── tsconfig.json          # TypeScript configuration
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Deploy the infrastructure:
   ```bash
   npm run deploy
   ```

## Available Scripts

- `npm run build` - Compile TypeScript code
- `npm run watch` - Watch for changes and compile
- `npm run test` - Run tests
- `npm run cdk` - Execute CDK CLI commands
- `npm run deploy` - Deploy the stack to AWS
- `npm run diff` - Show infrastructure changes
- `npm run synth` - Synthesize CloudFormation template

## API Endpoints

The API Gateway exposes the following endpoints:

- `GET /items` - List all items
- `POST /items` - Create a new item
- `GET /items/{id}` - Get a specific item
- `PUT /items/{id}` - Update a specific item
- `DELETE /items/{id}` - Delete a specific item

## Development

To make changes to the infrastructure:

1. Modify the stack definition in `lib/api-stack.ts`
2. Update Lambda function code in `src/lambda/`
3. Run `npm run build` to compile changes
4. Use `npm run diff` to review changes
5. Deploy with `npm run deploy`

## Security

- The API Gateway uses CORS with appropriate restrictions
- Lambda functions have minimal IAM permissions
- DynamoDB uses encryption at rest
