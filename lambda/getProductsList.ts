import { PRODUCTS } from './mock-data';

export const handler = async () => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(PRODUCTS),
  };
};
