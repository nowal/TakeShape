import { TElementProps } from '@/types/dom';
import { cx } from 'class-variance-authority';
import type { FC } from 'react';

type TProps = TElementProps & {
  leadingClassValue?: string;
  isDisabled?:boolean
};
export const TypographyFormTitle: FC<TProps> = ({
  classValue,
  leadingClassValue,
  isDisabled,
  children,
  ...props
}) => {
  return (
    <h3
      className={cx(
        'typography-form-title text-left',
        isDisabled && 'text-gray',
        leadingClassValue ?? 'leading-normal',
        classValue
      )}
      {...props}
    >
      {children}
    </h3>
  );
};
