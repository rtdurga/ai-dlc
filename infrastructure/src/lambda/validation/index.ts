import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const sqs = new SQSClient({});
const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

// Environment variables
const {
  INGESTION_QUEUE_URL,
  RETRY_QUEUE_URL,
  STATUS_TABLE_NAME,
  COVERAGE_TABLE_NAME
} = process.env;

// Validation schemas
interface CoveragePoint {
  cell_id: string;
  latitude: number;
  longitude: number;
  signal_strength: number;
  accuracy?: number;
  timestamp?: string;
}

interface BatchIngestionRequest {
  points: CoveragePoint[];
  metadata?: {
    source?: string;
    campaign?: string;
    device_id?: string;
  };
}

// Error types
const ErrorTypes = {
  VALIDATION: 'VALIDATION_ERROR',
  PROCESSING: 'PROCESSING_ERROR',
  SYSTEM: 'SYSTEM_ERROR'
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
};

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  // Handle OPTIONS requests for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  // Handle status check requests
  if (event.httpMethod === 'GET' && event.path.endsWith('/status')) {
    return await handleStatusCheck(event);
  }

  try {
    // Parse and validate request
    if (!event.body) {
      throw new Error('Missing request body');
    }

    const request: BatchIngestionRequest = JSON.parse(event.body);
    validateRequest(request);

    // Generate batch ID
    const batchId = uuidv4();
    const timestamp = new Date().toISOString();

    // Create status records for each point
    const statusPromises = request.points.map((point, index) => {
      const recordId = `${batchId}-${index}`;
      return dynamodb.send(new PutCommand({
        TableName: STATUS_TABLE_NAME,
        Item: {
          batch_id: batchId,
          record_id: recordId,
          status: 'PENDING',
          timestamp,
          point,
          metadata: request.metadata,
          error: null,
          retry_count: 0,
          ttl: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60) // 90 days TTL
        }
      }));
    });

    await Promise.all(statusPromises);

  // Send to ingestion queue with retry configuration
  await sqs.send(new SendMessageCommand({
    QueueUrl: INGESTION_QUEUE_URL,
    MessageBody: JSON.stringify({
      batchId,
      points: request.points,
      metadata: {
        ...request.metadata,
        coverage_table: COVERAGE_TABLE_NAME,
        retry_queue: RETRY_QUEUE_URL
      }
    })
  }));

    return {
      statusCode: 202,
      headers: corsHeaders,
      body: JSON.stringify({
        message: 'Data ingestion started',
        batchId,
        recordCount: request.points.length
      })
    };

  } catch (error: any) {
    console.error('Error processing request:', error);

    let statusCode = 500;
    let errorType = ErrorTypes.SYSTEM;
    let message = 'Internal server error';

    if (error.name === 'ValidationError') {
      statusCode = 400;
      errorType = ErrorTypes.VALIDATION;
      message = error.message;
    }

    return {
      statusCode,
      headers: corsHeaders,
      body: JSON.stringify({
        error: {
          type: errorType,
          message
        }
      })
    };
  }
}

async function handleStatusCheck(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const batchId = event.queryStringParameters?.batchId;
    
    if (!batchId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: {
            type: ErrorTypes.VALIDATION,
            message: 'Missing batchId parameter'
          }
        })
      };
    }

    const result = await dynamodb.send(new QueryCommand({
      TableName: STATUS_TABLE_NAME,
      KeyConditionExpression: 'batch_id = :batchId',
      ExpressionAttributeValues: {
        ':batchId': batchId
      }
    }));

    if (!result.Items || result.Items.length === 0) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({
          error: {
            type: ErrorTypes.VALIDATION,
            message: 'Batch not found'
          }
        })
      };
    }

    // Calculate statistics
    const stats = {
      total: result.Items.length,
      pending: 0,
      completed: 0,
      failed: 0,
      retrying: 0
    };

    result.Items.forEach(item => {
      switch (item.status) {
        case 'PENDING':
          stats.pending++;
          break;
        case 'COMPLETED':
          stats.completed++;
          break;
        case 'FAILED':
          stats.failed++;
          break;
        case 'RETRYING':
          stats.retrying++;
          break;
      }
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        batchId,
        stats,
        records: result.Items
      })
    };

  } catch (error) {
    console.error('Error checking status:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: {
          type: ErrorTypes.SYSTEM,
          message: 'Error checking ingestion status'
        }
      })
    };
  }
}

function validateRequest(request: BatchIngestionRequest): void {
  if (!request.points || !Array.isArray(request.points) || request.points.length === 0) {
    throw new ValidationError('Request must include non-empty points array');
  }

  if (request.points.length > 1000) {
    throw new ValidationError('Batch size cannot exceed 1000 points');
  }

  request.points.forEach((point, index) => {
    if (!point.cell_id) {
      throw new ValidationError(`Point at index ${index} missing cell_id`);
    }

    if (typeof point.latitude !== 'number' || point.latitude < -90 || point.latitude > 90) {
      throw new ValidationError(`Point at index ${index} has invalid latitude`);
    }

    if (typeof point.longitude !== 'number' || point.longitude < -180 || point.longitude > 180) {
      throw new ValidationError(`Point at index ${index} has invalid longitude`);
    }

    if (typeof point.signal_strength !== 'number' || point.signal_strength < -150 || point.signal_strength > 0) {
      throw new ValidationError(`Point at index ${index} has invalid signal_strength`);
    }

    if (point.accuracy !== undefined && (typeof point.accuracy !== 'number' || point.accuracy <= 0)) {
      throw new ValidationError(`Point at index ${index} has invalid accuracy`);
    }

    if (point.timestamp !== undefined) {
      const timestamp = new Date(point.timestamp).getTime();
      if (isNaN(timestamp)) {
        throw new ValidationError(`Point at index ${index} has invalid timestamp`);
      }
    }
  });
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
