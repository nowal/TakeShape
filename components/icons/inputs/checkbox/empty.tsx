import type { FC } from 'react';
import {
  CommonIcon,
  TCommonIconProps,
} from '@/components/icon';

export const IconsCheckboxEmpty: FC<TCommonIconProps> = (
  props
) => {
  return (
    <CommonIcon
      viewBox="0 0 24 24"
      d="M3 3h18v18H3zm16 16V5H5v14z"
      {...props}
    />
  );
};
