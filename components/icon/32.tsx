import type { FC } from 'react';
import {
  CommonIcon,
  TCommonIconProps,
} from '@/components/icon';

export const CommonIcon32: FC<TCommonIconProps> = (
  props
) => {
  return (
    <CommonIcon size={32} viewBox="0 0 32 32" {...props} />
  );
};
