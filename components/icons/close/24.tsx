import { TCommonIconProps } from '@/components/icon';
import { CommonIcon24 } from '@/components/icon/24';
import type { FC } from 'react';

export const IconsClose24: FC<TCommonIconProps> = (props) => {
  return (
    <CommonIcon24
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
