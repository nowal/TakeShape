import type { FC } from 'react';
import { TElementProps } from '@/types/dom';
import { cx } from 'class-variance-authority';

type TProps = TElementProps;
export const NotificationsHighlight: FC<TProps> = ({
  children,
  classValue,
  ...props
}) => {
  return (
    <p
      className={cx(
        'typography-sign-up-notification text-center rounded-xl py-3 px-4 bg-white-pink-3',
        classValue
      )}
      {...props}
    >
      {children}
    </p>
  );
};
