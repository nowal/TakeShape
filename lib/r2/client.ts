import { S3Client } from '@aws-sdk/client-s3';
import {
  getR2AccessKeyId,
  getR2Endpoint,
  getR2SecretAccessKey,
} from '@/lib/r2/config';

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: getR2Endpoint(),
  credentials: {
    accessKeyId: getR2AccessKeyId(),
    secretAccessKey: getR2SecretAccessKey(),
  },
});

