import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  
const BUCKET_NAME = process.env.BUCKET_NAME;

const client = new S3Client();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Import products file request', JSON.stringify(event));

  const { queryStringParameters } = event;

  try {
    if (typeof queryStringParameters?.name === 'undefined') {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid file name" }),
      };
    }

    const filename = queryStringParameters.name

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `uploaded/${filename}`,
    });

    const signedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });

    console.log('INFO', 'File has been uploaded');
    return {
      statusCode: 200,
      body: signedUrl,
      headers: { ...headers, "Content-Type": "text/plain" },
    };
  } catch (e) {
    console.error("Error:", e);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
      headers,
    };
  }
}