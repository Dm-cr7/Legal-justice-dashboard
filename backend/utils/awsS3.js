// utils/awsS3.js
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 client with region from env variables
const s3 = new S3Client({ region: process.env.AWS_REGION });

/**
 * Upload a file buffer or stream to S3
 * @param {string} bucket - S3 bucket name
 * @param {string} key - S3 object key (path + filename)
 * @param {Buffer|ReadableStream} body - file content
 * @param {string} contentType - MIME type of the file
 * @returns {Promise<void>}
 */
export async function uploadToS3(bucket, key, body, contentType = "application/octet-stream") {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  await s3.send(command);
}

/**
 * Get a readable stream for the S3 object
 * @param {string} bucket - S3 bucket name
 * @param {string} key - S3 object key
 * @returns {Promise<ReadableStream>}
 */
export async function getObjectStream(bucket, key) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const response = await s3.send(command);
  return response.Body; // This is a readable stream
}

/**
 * Generate a pre-signed URL for downloading an S3 object
 * @param {string} bucket - S3 bucket name
 * @param {string} key - S3 object key
 * @param {number} expiresIn - Expiration in seconds (default 900 = 15min)
 * @returns {Promise<string>} - pre-signed URL
 */
export async function getSignedDownloadUrl(bucket, key, expiresIn = 900) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const url = await getSignedUrl(s3, command, { expiresIn });
  return url;
}

// Export the s3 client instance as well
export { s3 };
