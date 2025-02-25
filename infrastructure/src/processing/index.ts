interface SQSMessage {
  messageId: string;
  body: string;
  attributes?: {
    approximateReceiveCount?: string;
  };
}
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { logger } from './logger';

// Initialize clients with configuration based on environment
const clientConfig = process.env.NODE_ENV === 'test' ? {
  region: 'local',
  endpoint: 'http://localhost:8000',
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test'
  },
  useQueueUrlAsEndpoint: true
} : {};

const sqs = new SQSClient(clientConfig);
const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient(clientConfig));

// Export clients for testing/mocking
export const clients = {
  sqs,
  dynamodb
};

interface CoveragePoint {
  cell_id: string;
  latitude: number;
  longitude: number;
  signal_strength: number;
  accuracy?: number;
  timestamp?: string;
}

interface BatchMessage {
  batchId: string;
  points: CoveragePoint[];
  metadata: Record<string, any>;
}

export async function processBatch(messages: SQSMessage[]): Promise<void> {
  const writeRequests = [];
  const deletePromises = [];
  const retryPromises = [];

  for (const message of messages) {
    try {
      const data: BatchMessage = JSON.parse(message.body);
      const timestamp = new Date().toISOString();

      // Process each point in the batch
      for (const point of data.points) {
        try {
          // Generate grid_id for location-based queries
          const grid_id = `${Math.floor(point.latitude)}_${Math.floor(point.longitude)}`;

          // Prepare write request
          writeRequests.push({
            PutRequest: {
              Item: {
                ...point,
                grid_id,
                timestamp: point.timestamp || timestamp,
                metadata: {
                  ...data.metadata,
                  batch_id: data.batchId
                },
                ttl: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60) // 90 days TTL
              }
            }
          });

          // If we've reached batch size, write to DynamoDB
          if (writeRequests.length >= 25) { // DynamoDB batch write limit
            await writeBatch(writeRequests);
            writeRequests.length = 0;
          }
        } catch (error: any) {
          logger.error('Error processing point:', {
            error: error.message,
            point,
            batchId: data.batchId
          });

          // Add to retry queue
          retryPromises.push(
            sqs.send(new SendMessageCommand({
              QueueUrl: process.env.RETRY_QUEUE_URL,
              MessageBody: JSON.stringify({
                batchId: data.batchId,
                point,
                metadata: data.metadata,
                retryCount: 1
              })
            }))
          );
          continue;
        }
      }

      // Write any remaining items
      if (writeRequests.length > 0) {
        await writeBatch(writeRequests);
        writeRequests.length = 0;
      }

      // Delete successfully processed message
      deletePromises.push(
        sqs.send(new SendMessageCommand({
          QueueUrl: process.env.INGESTION_QUEUE_URL,
          MessageBody: JSON.stringify({
            batchId: data.batchId,
            status: 'completed'
          })
        }))
      );

    } catch (error: any) {
      logger.error('Error processing message:', {
        error: error.message,
        messageId: message.messageId
      });

      // Move to DLQ after max retries
      if (message.attributes?.approximateReceiveCount && 
          parseInt(message.attributes.approximateReceiveCount) >= 3) {
        await sqs.send(new SendMessageCommand({
          QueueUrl: process.env.DLQ_URL,
          MessageBody: message.body
        }));
      } else {
        // Add to retry queue
        await sqs.send(new SendMessageCommand({
          QueueUrl: process.env.RETRY_QUEUE_URL,
          MessageBody: message.body
        }));
      }
    }
  }

  // Wait for all operations to complete
  await Promise.all([...deletePromises, ...retryPromises]);
}

async function writeBatch(writeRequests: any[]): Promise<void> {
  try {
    await dynamodb.send(new BatchWriteCommand({
      RequestItems: {
        'coverage_data': writeRequests
      }
    }));
  } catch (error: any) {
    logger.error('Error writing batch to DynamoDB:', {
      error: error.message,
      itemCount: writeRequests.length
    });
    throw error;
  }
}

// Start processing if this file is run directly
if (require.main === module) {
  logger.info('Starting processing service');
  // Add your service startup code here
}
