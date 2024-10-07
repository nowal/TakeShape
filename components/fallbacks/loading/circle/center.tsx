import { FallbacksLoadingCircle } from '@/components/fallbacks/loading/circle';
import { TDivProps } from '@/types/dom';
import { cx } from 'class-variance-authority';
import type { FC } from 'react';

type TProps = TDivProps;
export const FallbacksLoadingCircleCenter: FC<TProps> = ({
  classValue,
  ...props
}) => {
  return (
    <FallbacksLoadingCircle
      classValue={cx('justify-center', classValue)}
      {...props}
    />
  );
};
