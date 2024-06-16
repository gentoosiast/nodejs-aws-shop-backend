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

    const api = new apigateway.LambdaRestApi(this, 'ProductServiceApi', {
      handler: getProductsListFn,
      deployOptions: {
        stageName: 'dev',
      },
      proxy: false,
    });

    const getProductsListResource = api.root.addResource('products');
    getProductsListResource.addMethod('GET');
  }
}
