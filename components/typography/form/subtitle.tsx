import { TElementProps } from '@/types/dom';
import { cx } from 'class-variance-authority';
import type { FC } from 'react';

type TProps = TElementProps & {
  isDisabled?: boolean;
};
export const TypographyFormSubtitle: FC<TProps> = ({
  classValue,
  children,
  isDisabled,
  ...props
}) => {
  return (
    <h3
      className={cx(
        'typography-form-subtitle text-left',
        isDisabled && 'text-gray',
        classValue
      )}
      {...props}
    >
      {children}
    </h3>
  );
};
