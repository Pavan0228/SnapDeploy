import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config({
    path: "./.env",
});

// Initialize S3 client
const s3Client = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

export const uploadFileToS3 = async (file) => {
    // Check if required environment variables are set
    const bucketName = process.env.AWS_BUCKET_NAME;

    const fileExtension = file.originalname.split(".").pop();
    const fileName = `profiles/${uuidv4()}.${fileExtension}`;

    const params = {
        Bucket: bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    try {
        console.log(`Attempting to upload to bucket: ${bucketName}`);
        const command = new PutObjectCommand(params);
        const result = await s3Client.send(command);

        return {
            Location: `https://${bucketName}.s3.${
                process.env.AWS_REGION || "us-east-1"
            }.amazonaws.com/${fileName}`,
            ...result,
        };
    } catch (error) {
        console.error("S3 upload error details:", {
            message: error.message,
            code: error.code,
            requestId: error.$metadata?.requestId,
            bucketName,
        });
        throw error;
    }
};
