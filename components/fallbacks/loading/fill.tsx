import { FallbacksBasic } from '@/components/fallbacks/loading/basic';
import { TDivProps } from '@/types/dom';
import { cx } from 'class-variance-authority';
import type { FC } from 'react';

type TProps = TDivProps
export const FallbacksLoadingFill: FC<TProps> = ({
  children,
  classValue,
  ...props
}) => {
  return (
    <FallbacksBasic
      classValue={cx('absolute inset-0', classValue)}
      {...props}
    />
  );
};
