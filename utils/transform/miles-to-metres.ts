import { isNumber } from '@/utils/validation/is/number';

export const milesToMetres = (value: number | string) => {
  if (!isNumber(value)) {
    value = Number(value);
  }
  value = value * 1609.34;
  value = Math.floor(value);
  return value;
};
