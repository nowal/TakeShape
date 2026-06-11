const stripWrappingQuotes = (value: string) => {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1).trim();
  }

  return value;
};

const decodeIfEncoded = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const clean = (value: string | null | undefined) => {
  const trimmed = stripWrappingQuotes((value || '').trim());
  const decoded = stripWrappingQuotes(decodeIfEncoded(trimmed).trim());

  // URLSearchParams turns raw `+` characters into spaces. The generated admin
  // key is base64, so treating spaces as `+` makes copied raw URLs work too.
  return decoded.replace(/ /g, '+');
};

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
