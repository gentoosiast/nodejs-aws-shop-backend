import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import type { Construct } from 'constructs';

export class ProductServiceApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const getProductsListFn = new lambda.Function(this, 'products', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'getProductsList.handler',
    });

    const getProductsByIdFn = new lambda.Function(this, 'productsById', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'getProductsById.handler',
    });

    const api = new apigateway.RestApi(this, 'ProductServiceApi', {
      deployOptions: {
        stageName: 'dev',
      },
    });

    const getProductsListResource = api.root.addResource('products');
    getProductsListResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsListFn));

    const getProductsByIdResource = getProductsListResource.addResource('{id}');
    getProductsByIdResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsByIdFn));
  }
}
