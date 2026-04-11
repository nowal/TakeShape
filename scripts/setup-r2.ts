import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketCorsCommand,
  S3Client,
} from '@aws-sdk/client-s3';

const required = (name: string) => {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
};

const accountId = required('R2_ACCOUNT_ID');
const bucket = required('R2_BUCKET_NAME');
const accessKeyId = required('R2_ACCESS_KEY_ID');
const secretAccessKey = required('R2_SECRET_ACCESS_KEY');
const endpoint =
  process.env.R2_S3_API?.trim() ||
  `https://${accountId}.r2.cloudflarestorage.com`;
const allowedOrigins = String(
  process.env.R2_CORS_ORIGINS ||
    'http://localhost:3000,https://takeshapehome.com,https://app.takeshapehome.com'
)
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const client = new S3Client({
  endpoint,
  region: 'auto',
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const ensureBucket = async () => {
  try {
    await client.send(
      new HeadBucketCommand({
        Bucket: bucket,
      })
    );
    console.log(`Bucket already exists: ${bucket}`);
  } catch {
    await client.send(
      new CreateBucketCommand({
        Bucket: bucket,
      })
    );
    console.log(`Created bucket: ${bucket}`);
  }
};

const configureCors = async () => {
  await client.send(
    new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedOrigins: allowedOrigins,
            AllowedHeaders: ['*'],
            AllowedMethods: ['GET', 'PUT', 'HEAD'],
            ExposeHeaders: ['ETag', 'Content-Length', 'Content-Type'],
            MaxAgeSeconds: 86400,
          },
        ],
      },
    })
  );
  console.log(`Configured CORS for ${bucket}: ${allowedOrigins.join(', ')}`);
};

const main = async () => {
  await ensureBucket();
  await configureCors();
};

main().catch((error) => {
  console.error('R2 setup failed:', error);
  process.exit(1);
});

