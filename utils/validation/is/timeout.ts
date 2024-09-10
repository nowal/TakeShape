import {isDefined} from '@/utils/validation/is/defined';
import {isNumber} from '@/utils/validation/is/number';

export type TTimeout = ReturnType<Window['setTimeout']|typeof setTimeout>;
export const isTimeout = (value?: unknown | TTimeout): value is TTimeout => {
  if (isDefined(value) && isNumber(value)) return true;
  return false;
};
