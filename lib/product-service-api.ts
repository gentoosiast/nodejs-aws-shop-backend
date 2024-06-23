import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import type { Construct } from 'constructs';

export class ProductServiceApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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

    const api = new apigateway.RestApi(this, 'ProductServiceApi', {
      deployOptions: {
        stageName: 'dev',
      },
    });

    const getProductsListResource = api.root.addResource('products');
    getProductsListResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsListFn));

    // const getProductsByIdResourceRequestValidator = new apigateway.RequestValidator(
    //   this,
    //   'productsByIdRequestValidator',
    //   {
    //     restApi: api,
    //     requestValidatorName: 'productsByIdRequestValidator',
    //     validateRequestParameters: true,
    //   },
    // );

    const getProductsByIdResource = getProductsListResource.addResource('{id}');
    getProductsByIdResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsByIdFn), {
      // requestParameters: {
      //   'method.request.path.id': true,
      // },
      // requestValidator: getProductsByIdResourceRequestValidator,
    });
  }
}
