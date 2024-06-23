import { handler } from '../lambda/getProductsList';
import { productsArr } from '../lambda/mock-data';

describe('getProductsList', () => {
  it('should return array of mock products', async () => {
    const response = await handler();

    expect(response.body).toEqual(JSON.stringify(productsArr));
    expect(response.statusCode).toEqual(200);
  });
});
