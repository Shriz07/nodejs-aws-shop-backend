package com.myorg;

import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;
import software.constructs.Construct;

public class RsProductServiceStack extends Stack {
    public RsProductServiceStack(final Construct scope, final String id) {
        this(scope, id, null);
    }

    public RsProductServiceStack(final Construct scope, final String id, final StackProps props) {
        super(scope, id, props);

        GetProducts getProducts = new GetProducts(this, "ProductsList");
        GetProductsById getProductsById = new GetProductsById(this, "ProductsById");

        ApiGateway apiGateway = new ApiGateway(this, "ApiGateway", getProducts.getFunction(), getProductsById.getFunction());
    }
}
