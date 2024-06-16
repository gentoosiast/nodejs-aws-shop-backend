import type { APIGatewayEvent } from 'aws-lambda';
import { handler } from '../lambda/getProductsById';
import { PRODUCTS } from '../lambda/mock-data';

const VALID_PRODUCT_ID = '4';
const INVALID_PRODUCT_ID = '42';

describe('getProductsById', () => {
  it('should return single product when valid ID is specified', async () => {
    const product = PRODUCTS.find((product) => product.id === VALID_PRODUCT_ID);
    const response = await handler({
      pathParameters: { id: VALID_PRODUCT_ID },
    } as unknown as APIGatewayEvent);

    expect(response.body).toEqual(JSON.stringify(product));
    expect(response.statusCode).toEqual(200);
  });

  it('should return 404 status code when invalid ID is specified', async () => {
    const response = await handler({
      pathParameters: { id: INVALID_PRODUCT_ID },
    } as unknown as APIGatewayEvent);

    expect(response.statusCode).toEqual(404);
  });
});
