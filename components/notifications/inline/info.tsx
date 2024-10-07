import type { FC } from 'react';
import { TElementProps } from '@/types/dom';
import { cx } from 'class-variance-authority';

type TProps = TElementProps;
export const NotificationsInlineInfo: FC<TProps> = ({
  classValue,
  children,
  ...props
}) => {
  return (
    <p
      className={cx(
        'text-pink text-center text-sm font-semibold',
        classValue
      )}
      {...props}
    >
      {children}
    </p>
  );
};
