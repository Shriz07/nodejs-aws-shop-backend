package com.myorg;

import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;
import software.amazon.awscdk.services.lambda.Code;
import software.amazon.awscdk.services.lambda.Function;
import software.amazon.awscdk.services.lambda.Runtime;
import software.constructs.Construct;

public class GetProducts extends Stack {

    private final Function getProductsListFunction;

    public GetProducts(final Construct scope, final String id) {
        this(scope, id, null);
    }

    public GetProducts(final Construct scope, final String id, final StackProps props) {
        super(scope, id, props);

        getProductsListFunction = Function.Builder.create(this, "GetProductsListHandler")
        .runtime(Runtime.NODEJS_20_X)
        .code(Code.fromAsset("src/resources/lambda"))
        .handler("getProductsList.handler")
        .build();
    }

    public Function getFunction() {
        return  getProductsListFunction;    
    }
}
