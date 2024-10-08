import type { FC } from 'react';
import { TElementProps } from '@/types/dom';
import { cx } from 'class-variance-authority';

type TProps = TElementProps & {
  classDisplay?: string;
};
export const NotificationsInlineHighlight: FC<TProps> = ({
  children,
  classDisplay,
  classValue,
  ...props
}) => {
  return (
    <p
      className={cx(
        'typography-inline-notification text-center rounded-xl py-3 px-4 bg-white-pink-3',
        // 'whitespace-pre',
        'w-full',
        classDisplay ?? 'flex',
        classValue
      )}
      role="alert"
      {...props}
    >
      {children}
    </p>
  );
};
