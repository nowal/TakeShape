import { TCommonIconProps } from '@/components/icon';
import { CommonIcon12 } from '@/components/icon/12';
import type { FC } from 'react';

export const IconsCloseEm: FC<TCommonIconProps> = (
  props
) => {
  return (
    <CommonIcon12
      width="1em"
      height="1em"
      d="M11 1L1 11M1 1L11 11"
      pathProps={{
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }}
      fill="none"
      stroke="currentColor"
      {...props}
    />
  );
};
