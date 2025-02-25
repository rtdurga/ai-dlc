import { SQSEvent, SQSRecord } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const sqs = new SQSClient({});

// Environment variables
const {
  STATUS_TABLE_NAME,
  INGESTION_QUEUE_URL
} = process.env;

interface RetryMessage {
  batchId: string;
  point: {
    cell_id: string;
    latitude: number;
    longitude: number;
    signal_strength: number;
    accuracy?: number;
    timestamp?: string;
  };
  metadata: {
    source?: string;
    campaign?: string;
    device_id?: string;
    coverage_table: string;
    retry_queue: string;
  };
  retryCount: number;
}

export async function handler(event: SQSEvent): Promise<void> {
  for (const record of event.Records) {
    await processRetry(record);
  }
}

async function processRetry(record: SQSRecord): Promise<void> {
  try {
    const message: RetryMessage = JSON.parse(record.body);
    const timestamp = new Date().toISOString();

    // Update status to indicate retry attempt
    await updateStatus(message.batchId, message.point.cell_id, 'RETRYING', {
      retry_count: message.retryCount,
      last_retry: timestamp
    });

    // Send back to main ingestion queue
    await sqs.send(new SendMessageCommand({
      QueueUrl: INGESTION_QUEUE_URL,
      MessageBody: JSON.stringify({
        batchId: message.batchId,
        points: [message.point],
        metadata: message.metadata
      })
    }));

  } catch (error: any) {
    console.error('Error processing retry:', error);
    
    // Update status to failed if we can't process the retry
    try {
      const message: RetryMessage = JSON.parse(record.body);
      await updateStatus(message.batchId, message.point.cell_id, 'FAILED', {
        error: error.message || 'Unknown retry processing error',
        retry_count: message.retryCount
      });
    } catch (updateError: any) {
      console.error('Error updating status after retry failure:', updateError);
    }

    throw new Error(error.message || 'Unknown retry processing error');
  }
}

async function updateStatus(
  batchId: string,
  recordId: string,
  status: 'RETRYING' | 'FAILED',
  additionalData: Record<string, any> = {}
) {
  const timestamp = new Date().toISOString();

  await dynamodb.send(new UpdateCommand({
    TableName: STATUS_TABLE_NAME,
    Key: {
      batch_id: batchId,
      record_id: recordId
    },
    UpdateExpression: 'SET #status = :status, updated_at = :timestamp, #error = :error, retry_count = :retryCount, last_retry = :lastRetry',
    ExpressionAttributeNames: {
      '#status': 'status',
      '#error': 'error'
    },
    ExpressionAttributeValues: {
      ':status': status,
      ':timestamp': timestamp,
      ':error': additionalData.error || null,
      ':retryCount': additionalData.retry_count || 0,
      ':lastRetry': additionalData.last_retry || null
    }
  }));
}
