package com.myorg.productservice;

import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;
import software.amazon.awscdk.services.apigateway.LambdaIntegration;
import software.amazon.awscdk.services.apigateway.Resource;
import software.amazon.awscdk.services.apigateway.RestApi;
import software.amazon.awscdk.services.lambda.IFunction;
import software.constructs.Construct;

public class ApiGateway extends Stack {
    public ApiGateway(final Construct scope, final String id, final IFunction getProductsFunction,
     final IFunction getProductByIdFunction, final IFunction createProductFunction) {
        this(scope, id, getProductsFunction, getProductByIdFunction, createProductFunction, null);
    }

    public ApiGateway(final Construct scope, final String id, final IFunction getProductsFunction,
     final IFunction getProductByIdFunction, final IFunction createProductFunction, final StackProps props) {
        super(scope, id, props);

        RestApi api = RestApi.Builder.create(this, "ProductServiceGateway")
            .restApiName("Product Service")
            .description("Service responsible for product related operations.")
            .build();

        Resource productsResource = api.getRoot().addResource("products");
        productsResource.addMethod("GET", LambdaIntegration.Builder.create(getProductsFunction).build());
        productsResource.addMethod("POST", LambdaIntegration.Builder.create(createProductFunction).build());

        Resource productByIdResource = productsResource.addResource("{productId}");
        productByIdResource.addMethod("GET", LambdaIntegration.Builder.create(getProductByIdFunction).build());
    }
}
