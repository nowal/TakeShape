import {TTruthy} from '@/types/validation';
import {isFalsy} from '@/utils/validation/is/falsy';
import {isNull} from '@/utils/validation/is/null';

export const isTruthy = <T>(value?: T): value is TTruthy<T> =>
  !isFalsy(value) && !isNull(value);
