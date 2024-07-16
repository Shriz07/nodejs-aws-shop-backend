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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const csv_parser_1 = __importDefault(require("csv-parser"));
const s3Client = new client_s3_1.S3Client({});
const handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Start importFileParser");
    for (const record of event.Records) {
        const bucketName = record.s3.bucket.name;
        const objectKey = record.s3.object.key;
        const getObjectParams = {
            Bucket: bucketName,
            Key: objectKey,
        };
        try {
            const getObjectCommand = new client_s3_1.GetObjectCommand(getObjectParams);
            const { Body } = yield s3Client.send(getObjectCommand);
            if (!Body) {
                throw new Error("Object Body is empty");
            }
            const stream = Body;
            const parseCSV = new Promise((resolve, reject) => {
                stream
                    .pipe((0, csv_parser_1.default)())
                    .on("data", (data) => {
                    console.log("Record:", data);
                })
                    .on("end", () => {
                    console.log("CSV file successfully processed");
                    resolve();
                })
                    .on("error", (error) => {
                    console.error("Error processing CSV file:", error);
                    reject(error);
                });
            });
            yield parseCSV;
            const parsedKey = objectKey.replace("uploaded/", "parsed/");
            const copyObjectParams = {
                Bucket: bucketName,
                CopySource: `${bucketName}/${objectKey}`,
                Key: parsedKey,
            };
            const copyCommand = new client_s3_1.CopyObjectCommand(copyObjectParams);
            yield s3Client.send(copyCommand);
            console.log(`File copied to ${parsedKey}`);
            const deleteObjectParams = {
                Bucket: bucketName,
                Key: objectKey,
            };
            const deleteCommand = new client_s3_1.DeleteObjectCommand(deleteObjectParams);
            yield s3Client.send(deleteCommand);
            console.log(`File deleted from ${objectKey}`);
        }
        catch (error) {
            console.error("Error processing S3 event:", error);
        }
    }
});
exports.handler = handler;
