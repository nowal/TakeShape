import { TElementProps } from '@/types/dom';
import { cx } from 'class-variance-authority';
import type { FC } from 'react';

type TProps = TElementProps;
export const TypographyFormSubtitle: FC<TProps> = ({
  classValue,
  children,
  ...props
}) => {
  return (
    <h3
      className={cx('typography-form-subtitle text-left', classValue)}
      {...props}
    >
      {children}
    </h3>
  );
};
