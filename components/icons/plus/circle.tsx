import type { FC } from 'react';
import { TCommonIconProps } from '@/components/icon';
import { IconsPlus } from '@/components/icons/plus';
import { cx } from 'class-variance-authority';

export const IconsPlusCircle: FC<TCommonIconProps> = (
  props
) => {
  return (
    <div
      className={cx(
        'flex items-center justify-center size-8 shadow-09 bg-white rounded-full',
        'text-pink'
      )}
    >
      <IconsPlus {...props} />
    </div>
  );
};
