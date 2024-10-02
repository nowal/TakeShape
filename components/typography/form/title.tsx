import { TElementProps } from '@/types/dom';
import { cx } from 'class-variance-authority';
import type { FC } from 'react';

type TProps = TElementProps;
export const TypographyFormTitle: FC<TProps> = ({
  classValue,
  children,
  ...props
}) => {
  return (
    <h3
      className={cx(
        'typography-form-title leading-[38px] text-left',
        classValue
      )}
      {...props}
    >
      {children}
    </h3>
  );
};
