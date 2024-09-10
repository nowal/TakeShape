export const isBoolean = (value?: unknown | boolean): value is boolean => {
  if (typeof value === 'boolean') return true;
  return false;
};
