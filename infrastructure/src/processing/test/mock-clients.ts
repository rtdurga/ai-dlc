import { SQSClient } from '@aws-sdk/client-sqs';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// Create mock clients that don't make real network requests
export const createMockClients = () => {
  const mockSQS = new SQSClient({
    endpoint: 'http://localhost:8000',
    region: 'local',
    credentials: {
      accessKeyId: 'test',
      secretAccessKey: 'test'
    },
    // Override send to return empty success response
    requestHandler: {
      handle: async () => ({
        $metadata: {
          httpStatusCode: 200
        }
      })
    }
  });

  const mockDynamoDB = new DynamoDBClient({
    endpoint: 'http://localhost:8000',
    region: 'local',
    credentials: {
      accessKeyId: 'test',
      secretAccessKey: 'test'
    },
    // Override send to return empty success response
    requestHandler: {
      handle: async () => ({
        $metadata: {
          httpStatusCode: 200
        }
      })
    }
  });

  const mockDocClient = DynamoDBDocumentClient.from(mockDynamoDB);

  return {
    sqs: mockSQS,
    dynamodb: mockDocClient
  };
};
