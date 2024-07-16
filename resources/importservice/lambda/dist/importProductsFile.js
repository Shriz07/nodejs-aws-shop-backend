"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};
const BUCKET_NAME = process.env.BUCKET_NAME;
const client = new client_s3_1.S3Client();
const handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Import products file request', JSON.stringify(event));
    const { queryStringParameters } = event;
    try {
        if (typeof (queryStringParameters === null || queryStringParameters === void 0 ? void 0 : queryStringParameters.name) === 'undefined') {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Invalid file name" }),
            };
        }
        const filename = queryStringParameters.name;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: `uploaded/${filename}`,
        });
        const signedUrl = yield (0, s3_request_presigner_1.getSignedUrl)(client, command, { expiresIn: 3600 });
        console.log('INFO', 'File has been uploaded');
        return {
            statusCode: 200,
            body: signedUrl,
            headers: Object.assign(Object.assign({}, headers), { "Content-Type": "text/plain" }),
        };
    }
    catch (e) {
        console.error("Error:", e);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal server error" }),
            headers,
        };
    }
});
exports.handler = handler;
