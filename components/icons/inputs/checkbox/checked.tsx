import type { FC } from 'react';
import { TCommonIconProps } from '@/components/icon';
import { CommonIcon36 } from '@/components/icon/36';

export const IconsCheckboxChecked: FC<TCommonIconProps> = (
  props
) => {
  return (
    <CommonIcon36
      d="M5 3H3v18h18V3zm0 2h14v14H5zm4 7H7v2h2v2h2v-2h2v-2h2v-2h2V8h-2v2h-2v2h-2v2H9z"
      {...props}
    />
  );
};
