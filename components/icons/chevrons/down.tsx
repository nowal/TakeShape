import type { FC } from 'react';
import {
  CommonIcon,
  TCommonIconProps,
} from '@/components/icon';

export const CHEVRON_DOWN = 'M13 1L7 7L1 1';
export const IconsChevronsDown: FC<
  TCommonIconProps
> = (props) => {
  return (
    <CommonIcon
      width="14"
      height="9"
      viewBox="0 0 14 9"
      d={CHEVRON_DOWN}
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
