package com.myorg;

import java.util.List;
import java.util.Map;

import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;
import software.amazon.awscdk.services.iam.PolicyStatement;
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

        String region = Stack.of(this).getRegion();
        String accountId = Stack.of(this).getAccount();

        getProductsByIdFunction = Function.Builder.create(this, "GetProductByIdListHandler")
        .runtime(Runtime.NODEJS_20_X)
        .code(Code.fromAsset("src/resources/lambda"))
        .handler("getProductsById.handler")
        .environment(Map.of(
            "DB_REGION", region,
            "PRODUCTS_TABLE_NAME", "products",
            "STOCKS_TABLE_NAME", "stocks"
        ))
        .build();

        PolicyStatement dynamoDbPolicy = PolicyStatement.Builder.create()
            .actions(List.of("dynamodb:Scan", "dynamodb:Query", "dynamodb:GetItem"))
            .resources(List.of(
                "arn:aws:dynamodb:" + region + ":" + accountId + ":table/products",
                "arn:aws:dynamodb:" + region + ":" + accountId + ":table/stocks"
            ))
            .build();

        getProductsByIdFunction.addToRolePolicy(dynamoDbPolicy);
    }

    public Function getFunction() {
        return getProductsByIdFunction;
    }
}
