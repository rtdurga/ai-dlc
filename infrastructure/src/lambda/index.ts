import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME;

if (!TABLE_NAME) {
  throw new Error('TABLE_NAME environment variable is required');
}

// Define the structure of coverage data
interface CoveragePoint {
  cell_id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  signal_strength: number;
  accuracy: number;
  grid_id: string;
  ttl: number;
}

interface CoveragePolygon {
  cell_id: string;
  coordinates: Array<[number, number]>;
  metadata: {
    confidence: number;
    last_updated: string;
    data_points: number;
  };
}

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
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

  try {
    let result: APIGatewayProxyResult;

    switch (event.httpMethod) {
      case 'GET':
        if (event.pathParameters?.id) {
          result = await getItem(event.pathParameters.id);
        } else {
          result = await getItems();
        }
        break;
      
      case 'POST':
        try {
          const item = JSON.parse(event.body || '{}');
          result = await createItem(item);
        } catch (e) {
          return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ message: 'Invalid JSON in request body' })
          };
        }
        break;
      
      case 'PUT':
        if (!event.pathParameters?.id) {
          return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ message: 'Missing item ID' })
          };
        }
        try {
          const item = JSON.parse(event.body || '{}');
          result = await updateItem(event.pathParameters.id, item);
        } catch (e) {
          return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ message: 'Invalid JSON in request body' })
          };
        }
        break;
      
      case 'DELETE':
        if (!event.pathParameters?.id) {
          return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ message: 'Missing item ID' })
          };
        }
        result = await deleteItem(event.pathParameters.id);
        break;
      
      default:
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Invalid HTTP method' })
        };
    }

    // Add CORS headers to the result
    return {
      ...result,
      headers: {
        ...result.headers,
        ...corsHeaders
      }
    };

  } catch (error: any) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
}

async function getItems(): Promise<APIGatewayProxyResult> {
  const now = new Date();
  const threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 3));
  
  const result = await dynamodb.send(new ScanCommand({
    TableName: TABLE_NAME,
    FilterExpression: '#ts >= :minDate',
    ExpressionAttributeNames: {
      '#ts': 'timestamp'
    },
    ExpressionAttributeValues: {
      ':minDate': threeMonthsAgo.toISOString()
    }
  }));

  return {
    statusCode: 200,
    body: JSON.stringify(result.Items || [])
  };
}

async function getItem(cell_id: string): Promise<APIGatewayProxyResult> {
  const result = await dynamodb.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { cell_id }
  }));

  if (!result.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'Item not found' })
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(result.Item)
  };
}

async function createItem(item: Partial<CoveragePoint>): Promise<APIGatewayProxyResult> {
  // Validate required fields
  if (!item || typeof item !== 'object' || !item.cell_id || !item.latitude || !item.longitude || !item.signal_strength) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing required fields: cell_id, latitude, longitude, signal_strength' })
    };
  }

  const timestamp = new Date().toISOString();
  const ttl = Math.floor(new Date().setMonth(new Date().getMonth() + 3) / 1000); // 3 months TTL
  
  // Generate grid_id based on lat/long for location-based queries
  const grid_id = `${Math.floor(item.latitude)}_${Math.floor(item.longitude)}`;

  const newItem: CoveragePoint = {
    cell_id: item.cell_id,
    timestamp,
    latitude: item.latitude,
    longitude: item.longitude,
    signal_strength: item.signal_strength,
    accuracy: item.accuracy || 1.0,
    grid_id,
    ttl
  };

  await dynamodb.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: newItem
  }));

  return {
    statusCode: 201,
    body: JSON.stringify(newItem)
  };
}

async function updateItem(cell_id: string, item: Partial<CoveragePoint>): Promise<APIGatewayProxyResult> {
  // Validate input
  if (!item || typeof item !== 'object' || Object.keys(item).length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid update data' })
    };
  }

  // Prepare update data
  const updateData: Partial<CoveragePoint> = {};
  
  // Update allowed fields
  if (item.latitude !== undefined) updateData.latitude = item.latitude;
  if (item.longitude !== undefined) updateData.longitude = item.longitude;
  if (item.signal_strength !== undefined) updateData.signal_strength = item.signal_strength;
  if (item.accuracy !== undefined) updateData.accuracy = item.accuracy;

  // Update timestamp and grid_id if location changed
  if (item.latitude !== undefined || item.longitude !== undefined) {
    updateData.grid_id = `${Math.floor(item.latitude || 0)}_${Math.floor(item.longitude || 0)}`;
  }
  
  updateData.timestamp = new Date().toISOString();
  updateData.ttl = Math.floor(new Date().setMonth(new Date().getMonth() + 3) / 1000);

  const updateExpression = 'set ' + Object.keys(updateData).map(key => `#${key} = :${key}`).join(', ');
  const expressionAttributeNames = Object.keys(updateData).reduce<Record<string, string>>((acc, key) => ({
    ...acc,
    [`#${key}`]: key
  }), {});
  const expressionAttributeValues = Object.keys(updateData).reduce<Record<string, any>>((acc, key) => ({
    ...acc,
    [`:${key}`]: (updateData as any)[key]
  }), {});

  try {
    await dynamodb.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { cell_id },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ConditionExpression: 'attribute_exists(cell_id)' // Ensure item exists
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        cell_id,
        ...updateData
      })
    };
  } catch (error: any) {
    if (error?.name === 'ConditionalCheckFailedException') {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Item not found' })
      };
    }
    throw error;
  }
}

async function deleteItem(cell_id: string): Promise<APIGatewayProxyResult> {
  try {
    await dynamodb.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { cell_id },
      ConditionExpression: 'attribute_exists(cell_id)' // Ensure item exists
    }));

    return {
      statusCode: 204,
      body: ''
    };
  } catch (error: any) {
    if (error?.name === 'ConditionalCheckFailedException') {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Item not found' })
      };
    }
    throw error;
  }
}
