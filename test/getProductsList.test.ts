import { handler } from '../lambda/getProductsList';
import { PRODUCTS } from '../lambda/mock-data';

describe('getProductsList', () => {
  it('should return array of mock products', async () => {
    const response = await handler();

    expect(response.body).toEqual(JSON.stringify(PRODUCTS));
  });
});
