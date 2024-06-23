import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { ResponseType } from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import type { Construct } from 'constructs';

export class ProductServiceApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new apigateway.RestApi(this, 'ProductServiceApi', {
      deployOptions: {
        stageName: 'dev',
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    api.addGatewayResponse('CreateProductValidationFailed', {
      type: ResponseType.BAD_REQUEST_BODY,
      templates: {
        'application/json':
          '{"message": "$context.error.messageString", "issues": ["$context.error.validationErrorString"]}',
      },
    });

    const getProductsListFn = new lambda.Function(this, 'products', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'getProductsList.handler',
      environment: {
        PRODUCTS_TABLE_NAME: 'rsschool_product',
        STOCKS_TABLE_NAME: 'rsschool_stock',
      },
    });

    getProductsListFn.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['dynamodb:Scan'],
        resources: [
          'arn:aws:dynamodb:eu-north-1:211125330358:table/rsschool_product',
          'arn:aws:dynamodb:eu-north-1:211125330358:table/rsschool_stock',
        ],
      }),
    );

    const getProductsByIdFn = new lambda.Function(this, 'productsById', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'getProductsById.handler',
      environment: {
        PRODUCTS_TABLE_NAME: 'rsschool_product',
        STOCKS_TABLE_NAME: 'rsschool_stock',
      },
    });

    getProductsByIdFn.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['dynamodb:Query'],
        resources: [
          'arn:aws:dynamodb:eu-north-1:211125330358:table/rsschool_product',
          'arn:aws:dynamodb:eu-north-1:211125330358:table/rsschool_stock',
        ],
      }),
    );

    const createProductRequestValidator = new apigateway.RequestValidator(
      this,
      'createProductRequestValidator',
      {
        restApi: api,
        requestValidatorName: 'createProductRequestValidator',
        validateRequestBody: true,
      },
    );

    const createProductFn = new lambda.Function(this, 'createProduct', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'createProduct.handler',
      environment: {
        PRODUCTS_TABLE_NAME: 'rsschool_product',
        STOCKS_TABLE_NAME: 'rsschool_stock',
      },
    });

    createProductFn.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['dynamodb:PutItem'],
        resources: [
          'arn:aws:dynamodb:eu-north-1:211125330358:table/rsschool_product',
          'arn:aws:dynamodb:eu-north-1:211125330358:table/rsschool_stock',
        ],
      }),
    );

    const productModel = new apigateway.Model(this, 'productModel', {
      restApi: api,
      contentType: 'application/json',
      schema: {
        type: apigateway.JsonSchemaType.OBJECT,
        properties: {
          title: {
            type: apigateway.JsonSchemaType.STRING,
            minLength: 1,
          },
          description: {
            type: apigateway.JsonSchemaType.STRING,
          },
          price: {
            type: apigateway.JsonSchemaType.NUMBER,
            minimum: 0,
          },
          count: {
            type: apigateway.JsonSchemaType.NUMBER,
            minimum: 0,
          },
        },
        required: ['title', 'price', 'count'],
      },
    });

    const productsResource = api.root.addResource('products');
    productsResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsListFn));
    productsResource.addMethod('POST', new apigateway.LambdaIntegration(createProductFn), {
      requestValidator: createProductRequestValidator,
      requestModels: {
        'application/json': productModel,
      },
    });

    const getProductsByIdResourceRequestValidator = new apigateway.RequestValidator(
      this,
      'productsByIdRequestValidator',
      {
        restApi: api,
        requestValidatorName: 'productsByIdRequestValidator',
        validateRequestParameters: true,
      },
    );

    const getProductsByIdResource = productsResource.addResource('{id}');
    getProductsByIdResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsByIdFn), {
      requestParameters: {
        'method.request.path.id': true,
      },
      requestValidator: getProductsByIdResourceRequestValidator,
    });
  }
}
