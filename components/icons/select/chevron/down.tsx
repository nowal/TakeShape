import type { FC } from 'react';
import {
  CommonIcon,
  TCommonIconProps,
} from '@/components/icon';

export const CHEVRON_DOWN =
  'M2.125 2.09326L5.93842 5.90668L9.75183 2.09326';
export const IconsSelectChevronDown: FC<TCommonIconProps> = (
  props
) => {
  return (
    <CommonIcon
      width="12"
      height="8"
      viewBox="0 0 12 8"
      fill="none"
      d={CHEVRON_DOWN}
      pathProps={{
        strokeWidth: '2.86006',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }}
      {...props}
    />
  );
};
