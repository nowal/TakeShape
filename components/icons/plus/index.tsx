import type { FC } from 'react';
import { CommonIcon32vb24 } from '@/components/icon/32vb24';
import { TCommonIconProps } from '@/components/icon';

export const IconsPlus: FC<TCommonIconProps> = (props) => {
  return (
    <CommonIcon32vb24
      d="M18 12.998h-5v5a1 1 0 0 1-2 0v-5H6a1 1 0 0 1 0-2h5v-5a1 1 0 0 1 2 0v5h5a1 1 0 0 1 0 2"
      pathProps={{
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }}
      fill="currentColor"
      stroke="none"
      {...props}
    />
  );
};
