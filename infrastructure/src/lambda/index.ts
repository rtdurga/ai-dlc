import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME;

if (!TABLE_NAME) {
  throw new Error('TABLE_NAME environment variable is required');
}

// Define the structure of our items
interface Item {
  id: string;
  [key: string]: any;
  createdAt?: string;
  updatedAt?: string;
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

  } catch (error) {
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
  const result = await dynamodb.send(new ScanCommand({
    TableName: TABLE_NAME
  }));

  return {
    statusCode: 200,
    body: JSON.stringify(result.Items || [])
  };
}

async function getItem(id: string): Promise<APIGatewayProxyResult> {
  const result = await dynamodb.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { id }
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

async function createItem(item: Partial<Item>): Promise<APIGatewayProxyResult> {
  // Validate required fields
  if (!item || typeof item !== 'object') {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid item data' })
    };
  }

  const timestamp = new Date().toISOString();
  const newItem: Item = {
    id: Date.now().toString(), // Simple ID generation
    ...item,
    createdAt: timestamp,
    updatedAt: timestamp
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

async function updateItem(id: string, item: Partial<Item>): Promise<APIGatewayProxyResult> {
  // Validate input
  if (!item || typeof item !== 'object' || Object.keys(item).length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid update data' })
    };
  }

  // Remove readonly fields
  const updateData = { ...item };
  delete updateData.id;
  delete updateData.createdAt;

  const timestamp = new Date().toISOString();
  updateData.updatedAt = timestamp;

  const updateExpression = 'set ' + Object.keys(updateData).map(key => `#${key} = :${key}`).join(', ');
  const expressionAttributeNames = Object.keys(updateData).reduce((acc, key) => ({
    ...acc,
    [`#${key}`]: key
  }), {});
  const expressionAttributeValues = Object.keys(updateData).reduce((acc, key) => ({
    ...acc,
    [`:${key}`]: updateData[key]
  }), {});

  try {
    await dynamodb.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ConditionExpression: 'attribute_exists(id)' // Ensure item exists
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        id,
        ...updateData
      })
    };
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Item not found' })
      };
    }
    throw error;
  }
}

async function deleteItem(id: string): Promise<APIGatewayProxyResult> {
  try {
    await dynamodb.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id },
      ConditionExpression: 'attribute_exists(id)' // Ensure item exists
    }));

    return {
      statusCode: 204,
      body: ''
    };
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Item not found' })
      };
    }
    throw error;
  }
}
