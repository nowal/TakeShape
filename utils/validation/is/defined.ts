import {TDefined} from '@/types/validation';

export const isDefined = <T>(
  value?: T
): value is TDefined<T> => {
  if (typeof value !== 'undefined') return true;
  return false;
};
