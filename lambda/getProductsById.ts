import type { APIGatewayEvent } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET',
};

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
};

type Stock = {
  product_id: string;
  count: number;
};

export const handler = async (event: APIGatewayEvent) => {
  try {
    const productId = event.pathParameters?.id ?? '';

    console.log(`Lambda incoming request: /products/${productId}`);

    const getProductCommand = new QueryCommand({
      TableName: process.env.PRODUCTS_TABLE_NAME,
      KeyConditionExpression: 'id = :id',
      ExpressionAttributeValues: { ':id': productId },
    });
    const getStockCommand = new QueryCommand({
      TableName: process.env.STOCKS_TABLE_NAME,
      KeyConditionExpression: 'product_id = :productId',
      ExpressionAttributeValues: { ':productId': productId },
    });

    const [productResponse, stockResponse] = await Promise.all([
      docClient.send(getProductCommand),
      docClient.send(getStockCommand),
    ]);

    if (productResponse.Count === 0 || stockResponse.Count === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: `Product with ID ${productId} not found` }),
      };
    }

    const product = productResponse.Items?.[0] ?? {};
    const stock = stockResponse.Items?.[0] ?? {};
    const aggregatedProduct = { ...product, count: stock.count };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(aggregatedProduct),
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : err;

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: errorMessage }),
    };
  }
};
