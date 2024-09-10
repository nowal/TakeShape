import { TButtonsCvaIcon } from '@/components/buttons/types';
import {isDefined} from '@/utils/validation/is/defined';
import {isNull} from '@/utils/validation/is/null';

const EMPTY = {
  isLeading: false,
  isTrailing: false,
} as const;
export const iconResolve = (icon?: TButtonsCvaIcon) => {
  if (!isDefined(icon)) return EMPTY;

  const {Leading, Trailing} = icon;
  const isLeading = isDefined(Leading) && !isNull(Leading) && Leading !== false;
  const isTrailing =
    isDefined(Trailing) && !isNull(Trailing) && Trailing !== false;

  if (isLeading && isTrailing) {
    const r = {
      isLeading: true,
      isTrailing: true,
      Leading,
      Trailing,
    } as const;
    return r;
  }
  if (isLeading) {
    const r = {
      isLeading: true,
      isTrailing: false,
      Leading,
    } as const;
    return r;
  }
  if (isTrailing) {
    const r = {
      isLeading: false,
      isTrailing: true,
      Trailing,
    } as const;
    return r;
  }

  return EMPTY;
};
