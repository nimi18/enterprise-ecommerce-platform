import {
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import s3 from '../config/s3.js';
import env from '../config/env.js';

const uploadToS3 = async ({ buffer, mimeType, key }) => {
  await s3.send(
    new PutObjectCommand({
      Bucket: env.awsS3Bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );

  return `https://${env.awsS3Bucket}.s3.${env.awsRegion}.amazonaws.com/${key}`;
};

const deleteFromS3 = async (key) => {
  if (!key) return;

  await s3.send(
    new DeleteObjectCommand({
      Bucket: env.awsS3Bucket,
      Key: key,
    })
  );
};

export { uploadToS3, deleteFromS3 };