import {isDefined} from '@/utils/validation/is/defined';

export const isValue = <T>(value?: T): value is Exclude<T, undefined> => {
  if (isDefined(value) && value !== null) return true;
  return false;
};
