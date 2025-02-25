import { SQSEvent, SQSRecord } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const sqs = new SQSClient({});

// Environment variables
const {
  STATUS_TABLE_NAME,
  COVERAGE_TABLE_NAME,
  RETRY_QUEUE_URL
} = process.env;

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
  metadata: {
    source?: string;
    campaign?: string;
    device_id?: string;
    coverage_table: string;
    retry_queue: string;
  };
}

export async function handler(event: SQSEvent): Promise<void> {
  for (const record of event.Records) {
    await processRecord(record);
  }
}

async function processRecord(record: SQSRecord): Promise<void> {
  try {
    const message: BatchMessage = JSON.parse(record.body);
    const timestamp = new Date().toISOString();

    // Process each point in the batch
    for (const point of message.points) {
      try {
        // Generate grid_id for location-based queries
        const grid_id = `${Math.floor(point.latitude)}_${Math.floor(point.longitude)}`;

        // Store coverage data
        await dynamodb.send(new PutCommand({
          TableName: COVERAGE_TABLE_NAME,
          Item: {
            ...point,
            grid_id,
            timestamp: point.timestamp || timestamp,
            metadata: message.metadata,
            ttl: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60) // 90 days TTL
          }
        }));

        // Update status to completed
        await updateStatus(message.batchId, point.cell_id, 'COMPLETED');

      } catch (error: any) {
        console.error('Error processing point:', error);
        
        // Get current status to check retry count
        const status = await getStatus(message.batchId, point.cell_id);
        const retryCount = (status?.retry_count || 0) + 1;

        if (retryCount <= 3) {
          // Update status and send to retry queue
          await updateStatus(message.batchId, point.cell_id, 'RETRYING', {
            error: error.message || 'Unknown error',
            retry_count: retryCount
          });

          await sqs.send(new SendMessageCommand({
            QueueUrl: RETRY_QUEUE_URL,
            MessageBody: JSON.stringify({
              batchId: message.batchId,
              point,
              metadata: message.metadata,
              retryCount
            }),
            DelaySeconds: Math.pow(2, retryCount) // Exponential backoff
          }));
        } else {
          // Mark as failed after max retries
          await updateStatus(message.batchId, point.cell_id, 'FAILED', {
            error: error.message,
            retry_count: retryCount
          });
        }
      }
    }
  } catch (error: any) {
    console.error('Error processing batch:', error);
    throw new Error(error.message || 'Unknown batch processing error'); // Let SQS handle the retry
  }
}

async function getStatus(batchId: string, recordId: string) {
  const result = await dynamodb.send(new UpdateCommand({
    TableName: STATUS_TABLE_NAME,
    Key: {
      batch_id: batchId,
      record_id: recordId
    },
    ReturnValues: 'ALL_NEW'
  }));

  return result.Attributes;
}

async function updateStatus(
  batchId: string,
  recordId: string,
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'RETRYING',
  additionalData: Record<string, any> = {}
) {
  const timestamp = new Date().toISOString();

  await dynamodb.send(new UpdateCommand({
    TableName: STATUS_TABLE_NAME,
    Key: {
      batch_id: batchId,
      record_id: recordId
    },
    UpdateExpression: 'SET #status = :status, updated_at = :timestamp, #error = :error, retry_count = :retryCount',
    ExpressionAttributeNames: {
      '#status': 'status',
      '#error': 'error'
    },
    ExpressionAttributeValues: {
      ':status': status,
      ':timestamp': timestamp,
      ':error': additionalData.error || null,
      ':retryCount': additionalData.retry_count || 0
    }
  }));
}
