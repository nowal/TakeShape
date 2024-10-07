import { TElementProps } from '@/types/dom';
import { cx } from 'class-variance-authority';
import type { FC } from 'react';

type TProps = TElementProps;
export const TypographyButtonPrimary: FC<TProps> = ({
  classValue,
  children,
  ...props
}) => {
  return (
    <p
      className={cx(
        'typography-button-pink',
        classValue
      )}
      {...props}
    >
      {children}
    </p>
  );
};
