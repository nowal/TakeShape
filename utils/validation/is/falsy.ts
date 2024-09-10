import {TFalsy} from '@/types/validation';

export const isFalsy = (value?: unknown): value is TFalsy => {
  if (!value) {
    return true;
  }
  return false;
};
