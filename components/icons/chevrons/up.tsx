import type { FC } from 'react';
import {
  CommonIcon,
  TCommonIconProps,
} from '@/components/icon';

export const CHEVRON_UP = 'M13 7.5L7 1.5L1 7.5';
export const IconsChevronsUp: FC<TCommonIconProps> = (
  props
) => {
  return (
    <CommonIcon
      width="14"
      height="9"
      viewBox="0 0 14 9"
      d={CHEVRON_UP}
      fill="none"
      stroke="var(--pink)"
      pathProps={{
        strokeWidth: '2',
        strokeLinecap: 'round',
      }}
      {...props}
    />
  );
};
