package com.myorg;

import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;
import software.amazon.awscdk.services.lambda.Code;
import software.amazon.awscdk.services.lambda.Function;
import software.amazon.awscdk.services.lambda.Runtime;
import software.constructs.Construct;

public class GetProductsById extends Stack {

    private final Function getProductsByIdFunction;

    public GetProductsById(final Construct scope, final String id) {
        this(scope, id, null);
    }

    public GetProductsById(final Construct scope, final String id, final StackProps props) {
        super(scope, id, props);

        getProductsByIdFunction = Function.Builder.create(this, "GetProductByIdListHandler")
        .runtime(Runtime.NODEJS_20_X)
        .code(Code.fromAsset("src/resources/lambda"))
        .handler("getProductsById.handler")
        .build();
    }

    public Function getFunction() {
        return getProductsByIdFunction;
    }
}
