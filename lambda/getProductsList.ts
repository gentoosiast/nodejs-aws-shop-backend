import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET',
};

export const handler = async () => {
  try {
    console.log('Lambda incoming request: GET /products');

    const scanProductsCommand = new ScanCommand({
      TableName: process.env.PRODUCTS_TABLE_NAME,
    });
    const scanStocksCommand = new ScanCommand({
      TableName: process.env.STOCKS_TABLE_NAME,
    });

    const [productsResponse, stocksResponse] = await Promise.all([
      docClient.send(scanProductsCommand),
      docClient.send(scanStocksCommand),
    ]);

    const products = productsResponse.Items ?? [];
    const stocks = stocksResponse.Items ?? [];

    const aggregatedProducts = products.map((product) => {
      const stock = stocks.find((stock) => stock.product_id === product.id);

      return {
        ...product,
        count: stock?.count ?? 0,
      };
    });

    return {
      status: 200,
      headers,
      body: JSON.stringify(aggregatedProducts),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: JSON.stringify(err, null, 2) }),
    };
  }
};
