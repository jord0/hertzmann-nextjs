import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

function getClient() {
  const accountId = process.env.CF_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('R2 environment variables are not configured');
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export async function uploadPhoto(
  photographerId: number,
  photoId: number,
  imageBuffer: Buffer
): Promise<void> {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) throw new Error('R2_BUCKET_NAME is not configured');

  await getClient().send(new PutObjectCommand({
    Bucket: bucket,
    Key: `photos/${photographerId}_${photoId}.jpg`,
    Body: imageBuffer,
    ContentType: 'image/jpeg',
  }));
}

export async function deletePhoto(
  photographerId: number,
  photoId: number
): Promise<void> {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) throw new Error('R2_BUCKET_NAME is not configured');

  await getClient().send(new DeleteObjectCommand({
    Bucket: bucket,
    Key: `photos/${photographerId}_${photoId}.jpg`,
  }));
}
