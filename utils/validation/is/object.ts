export const isObject = (value?: unknown | object): value is object => {
  if (typeof value === 'object') return true;
  return false;
};
