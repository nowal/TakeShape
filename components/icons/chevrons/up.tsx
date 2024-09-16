import type { FC } from 'react';
import { TCommonIconProps } from '@/components/icon';
import { CommonIcon16vb24 } from '@/components/icon/16vb24';

export const CHEVRON_UP =
  'M7 16H5v-2h2v-2h2v-2h2V8h2v2h2v2h2v2h2v2h-2v-2h-2v-2h-2v-2h-2v2H9v2H7z';
export const IconsChevronsUp: FC<TCommonIconProps> = (
  props
) => {
  return <CommonIcon16vb24 d={CHEVRON_UP} {...props} />;
};
