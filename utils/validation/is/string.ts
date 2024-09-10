export const isString = (value?: unknown | string): value is string => {
  if (typeof value === 'string') return true;
  return false;
};
