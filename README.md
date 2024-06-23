# Task 3 (First API with AWS API Gateway and AWS Lambda)

Microservice `ProductServiceApi` created using `AWS CDK`, `AWS API Gateway`, `AWS Lambda`.

## Endpoints

`GET /products`

The response from the lambda returns full array of products (data stored in DynamoDB).

`POST /products`

This request allows to create new product

`GET /products/{productId}`

The response from the lambda returns searched product from an array of products or error message and 404 status code if product was not found (data stored in DynamoDB).

Lambda handlers covered by unit tests.

Swagger (OpenAPI) documentation is provided <https://raw.githubusercontent.com/gentoosiast/nodejs-aws-shop-backend/task-4/openapi.json>

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `npm run test:watch` run jest unit test in watch mode
- `npm run format` format source code and configs with Prettier
- `npm run cdk`
- `npm run deploy` deploy stack with the application to AWS
- `npm run destroy` destroy deployed stack freeing all AWS resources
- `npm run seed:db` seed DynamoDB with sample data
- `npx cdk deploy` deploy this stack to your default AWS account/region
- `npx cdk diff` compare deployed stack with current state
- `npx cdk synth` emits the synthesized CloudFormation template
