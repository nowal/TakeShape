const required = (name: string) => {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
};

export const getR2AccountId = () =>
  required('R2_ACCOUNT_ID');

export const getR2BucketName = () =>
  required('R2_BUCKET_NAME');

export const getR2AccessKeyId = () =>
  required('R2_ACCESS_KEY_ID');

export const getR2SecretAccessKey = () =>
  required('R2_SECRET_ACCESS_KEY');

export const getR2Endpoint = () => {
  const explicit = process.env.R2_S3_API;
  if (explicit && explicit.trim()) {
    return explicit.trim();
  }
  return `https://${getR2AccountId()}.r2.cloudflarestorage.com`;
};

