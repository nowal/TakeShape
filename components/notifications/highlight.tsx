import type { FC } from 'react';
import { TElementProps } from '@/types/dom';
import { cx } from 'class-variance-authority';

type TProps = TElementProps & {
  classDisplay?: string;
};
export const NotificationsHighlight: FC<TProps> = ({
  children,
  classDisplay,
  classValue,
  ...props
}) => {
  return (
    <p
      className={cx(
        'typography-signup-notification text-center rounded-xl py-3 px-4 bg-white-pink-3',
        classDisplay ?? 'flex',
        classValue
      )}
      {...props}
    >
      {children}
    </p>
  );
};
