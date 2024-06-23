import type { APIGatewayEvent } from 'aws-lambda';
import { productsMap } from './mock-data';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET',
};

export const handler = async (event: APIGatewayEvent) => {
  const productId = event.pathParameters?.id ?? '';
  const product = productsMap.get(productId);

  if (!product) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: 'Product not found' }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(product),
  };
};
