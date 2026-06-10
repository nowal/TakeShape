const clean = (value: string | null | undefined) => (value || '').trim();

export const getSalesAdminAccessKey = () =>
  clean(process.env.SALES_ADMIN_ACCESS_KEY);

export const isSalesAdminAccessAllowed = (providedKey?: string | null) => {
  const requiredKey = getSalesAdminAccessKey();
  if (requiredKey) return clean(providedKey) === requiredKey;

  return process.env.NODE_ENV !== 'production';
};

export const getSalesAdminAccessDeniedMessage = () =>
  getSalesAdminAccessKey()
    ? 'Sales admin access key is invalid.'
    : 'Set SALES_ADMIN_ACCESS_KEY before using this page in production.';
