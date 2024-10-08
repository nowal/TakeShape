import { TDivProps } from '@/types/dom';
import { cx } from 'class-variance-authority';
import type { FC } from 'react';

type TProps = TDivProps;
export const FallbacksBasic: FC<TProps> = ({
  children,
  classValue,
  ...props
}) => {
  return (
    <div
      className={cx(classValue ?? 'relative')}
      {...props}
    />
  );
};
