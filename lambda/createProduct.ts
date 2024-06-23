import { randomUUID } from 'node:crypto';
import type { APIGatewayEvent } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export const handler = async (event: APIGatewayEvent) => {
  try {
    console.log('Lambda incoming request: POST /products');

    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Invalid request body' }),
      };
    }

    console.log(`Request body: ${event.body}`);

    const reqBody = JSON.parse(event.body);

    const createProductCommand = new PutCommand({
      TableName: process.env.PRODUCTS_TABLE_NAME,
      Item: { ...reqBody, id: randomUUID() },
    });

    const response = await docClient.send(createProductCommand);

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(response),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify(err, null, 2),
    };
  }
};
