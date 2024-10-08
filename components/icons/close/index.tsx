import { TCommonIconProps } from '@/components/icon';
import { CommonIcon12 } from '@/components/icon/12';
import type { FC } from 'react';

export const IconsClose: FC<TCommonIconProps> = (props) => {
  return (
    <CommonIcon12
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
