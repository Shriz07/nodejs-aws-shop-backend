package com.myorg;

import com.myorg.importservice.RsImportServiceStack;
import com.myorg.productservice.RsProductServiceStack;

import software.amazon.awscdk.App;
import software.amazon.awscdk.Environment;
import software.amazon.awscdk.StackProps;

public class RsProductServiceApp {
    public static void main(final String[] args) {
        App app = new App();

        new RsProductServiceStack(app, "RsProductServiceStack", StackProps.builder()
                .env(Environment.builder()
                        .account(System.getenv("CDK_DEFAULT_ACCOUNT"))
                        .region(System.getenv("CDK_DEFAULT_REGION"))
                        .build())
                .build());

        new RsImportServiceStack(app, "RsImportServiceStack", StackProps.builder()
                .env(Environment.builder()
                        .account(System.getenv("CDK_DEFAULT_ACCOUNT"))
                        .region(System.getenv("CDK_DEFAULT_REGION"))
                        .build())
                .build());

        app.synth();
    }
}

