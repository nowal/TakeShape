import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client } from '@/lib/r2/client';
import { getR2BucketName } from '@/lib/r2/config';

export const uploadRemoteVideoToR2 = async ({
  sourceUrl,
  objectKey,
  contentType = 'video/mp4',
}: {
  sourceUrl: string;
  objectKey: string;
  contentType?: string;
}) => {
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch upstream media (${response.status}): ${response.statusText}`
    );
  }

  const body = Buffer.from(await response.arrayBuffer());

  await r2Client.send(
    new PutObjectCommand({
      Bucket: getR2BucketName(),
      Key: objectKey,
      Body: body,
      ContentType: contentType,
    })
  );

  return {
    bucket: getR2BucketName(),
    key: objectKey,
    contentType,
    fileSizeBytes: body.byteLength,
  };
};

