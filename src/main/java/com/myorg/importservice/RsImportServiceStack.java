package com.myorg.importservice;

import java.util.List;
import java.util.Map;

import software.amazon.awscdk.RemovalPolicy;
import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;
import software.amazon.awscdk.services.lambda.Code;
import software.amazon.awscdk.services.lambda.Function;
import software.amazon.awscdk.services.lambda.Runtime;
import software.amazon.awscdk.services.s3.Bucket;
import software.amazon.awscdk.services.s3.BucketProps;
import software.amazon.awscdk.services.s3.CorsRule;
import software.amazon.awscdk.services.s3.EventType;
import software.amazon.awscdk.services.s3.HttpMethods;
import software.amazon.awscdk.services.s3.NotificationKeyFilter;
import software.amazon.awscdk.services.s3.notifications.LambdaDestination;
import software.constructs.Construct;

public class RsImportServiceStack extends Stack {
    public RsImportServiceStack(final Construct scope, final String id) {
        this(scope, id, null);
    }

    public RsImportServiceStack(final Construct scope, final String id, final StackProps props) {
        super(scope, id, props);

        String region = Stack.of(this).getRegion();
        String accountId = Stack.of(this).getAccount();

        String bucketName = String.format("importservice-%s-%s", accountId, region);

        Bucket importBucket = new Bucket(this, "importService", BucketProps.builder()
        .bucketName(bucketName)
        .removalPolicy(RemovalPolicy.DESTROY)
        .versioned(true)
        .cors(List.of(
                CorsRule.builder()
                        .id("allow-all")
                        .allowedMethods(List.of(HttpMethods.PUT))
                        .allowedHeaders(List.of("*"))
                        .allowedOrigins(List.of("https://d3oe5u8ms2z37w.cloudfront.net"))
                        .build())
        )
        .autoDeleteObjects(true)
        .build());

        String importProductsFileFunctionName = String.format("ImportProductsFileHandler-%s-%s", accountId, region);
        String importFileParserFunctionName = String.format("ImportFileParserHandler-%s-%s", accountId, region);

        Function importProductsFileFunction = Function.Builder.create(this, "ImportProductsFileHandler")
            .functionName(importProductsFileFunctionName)
            .runtime(Runtime.NODEJS_20_X)
            .code(Code.fromAsset("./resources/importservice/lambda/dist"))
            .handler("importProductsFile.handler")
            .environment(Map.of(
                "BUCKET_NAME", bucketName
            ))
            .build();
        
        Function importFileParserFunction = Function.Builder.create(this, "ImportFileParserHandler")
        .functionName(importFileParserFunctionName)
        .runtime(Runtime.NODEJS_20_X)
        .code(Code.fromAsset("./resources/importservice/lambda/dist"))
        .handler("importFileParser.handler")
        .environment(Map.of(
            "BUCKET_NAME", bucketName
        ))
        .build();

        importBucket.grantReadWrite(importProductsFileFunction);
        importBucket.grantReadWrite(importFileParserFunction);

        ApiGateway apiGateway = new ApiGateway(this, "ApiGateway", importProductsFileFunction);

        importBucket.addEventNotification(EventType.OBJECT_CREATED,
                new LambdaDestination(importFileParserFunction),
                NotificationKeyFilter.builder()
                        .prefix("uploaded/")
                        .build());
    }
}
