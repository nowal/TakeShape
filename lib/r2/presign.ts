import {
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client } from '@/lib/r2/client';
import { getR2BucketName } from '@/lib/r2/config';

const DEFAULT_UPLOAD_TTL_SECONDS = 900;
const DEFAULT_DOWNLOAD_TTL_SECONDS = 3600;

const resolveTtl = (
  rawValue: string | undefined,
  fallback: number
) => {
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
};

export const signR2UploadUrl = async ({
  key,
  contentType,
}: {
  key: string;
  contentType: string;
}) => {
  const command = new PutObjectCommand({
    Bucket: getR2BucketName(),
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(r2Client, command, {
    expiresIn: resolveTtl(
      process.env.R2_UPLOAD_SIGN_TTL_SECONDS,
      DEFAULT_UPLOAD_TTL_SECONDS
    ),
  });
};

export const signR2DownloadUrl = async (key: string) => {
  const command = new GetObjectCommand({
    Bucket: getR2BucketName(),
    Key: key,
  });

  return getSignedUrl(r2Client, command, {
    expiresIn: resolveTtl(
      process.env.R2_DOWNLOAD_SIGN_TTL_SECONDS,
      DEFAULT_DOWNLOAD_TTL_SECONDS
    ),
  });
};

