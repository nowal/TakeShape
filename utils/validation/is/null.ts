import {isDefined} from '@/utils/validation/is/defined';

export const isNull = (value?: null | unknown): value is null => {
  if (isDefined(value) && value === null) return true;
  return false;
};
