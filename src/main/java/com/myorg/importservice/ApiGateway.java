package com.myorg.importservice;

import java.util.List;

import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;
import software.amazon.awscdk.services.apigateway.Cors;
import software.amazon.awscdk.services.apigateway.CorsOptions;
import software.amazon.awscdk.services.apigateway.LambdaIntegration;
import software.amazon.awscdk.services.apigateway.Resource;
import software.amazon.awscdk.services.apigateway.RestApi;
import software.amazon.awscdk.services.lambda.IFunction;
import software.constructs.Construct;

public class ApiGateway extends Stack {
    public ApiGateway(final Construct scope, final String id, final IFunction importProductsFileFunction) {
        this(scope, id, importProductsFileFunction, null);
    }

    public ApiGateway(final Construct scope, final String id, final IFunction importProductsFileFunction, final StackProps props) {
        super(scope, id, props);

        RestApi api = RestApi.Builder.create(this, "ImportServiceGateway")
            .restApiName("Import Service")
            .description("Service responsible for products import.")
            .defaultCorsPreflightOptions(CorsOptions.builder()
                .allowOrigins(Cors.ALL_ORIGINS)
                .allowMethods(Cors.ALL_METHODS)
                .allowHeaders(List.of("Content-Type", "X-Amz-Date", "Authorization", "X-Api-Key", "X-Amz-Security-Token"))
                .build())
            .build();

        Resource importResource = api.getRoot().addResource("import");
        importResource.addMethod("GET", LambdaIntegration.Builder.create(importProductsFileFunction).build());
        importResource.addMethod("PUT", LambdaIntegration.Builder.create(importProductsFileFunction).build());
    }
}
