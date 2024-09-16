import type { FC } from 'react';
import { TInputProps } from '@/types/dom/element';
import { cx } from 'class-variance-authority';

type TProps = TInputProps;
export const InputsCheckbox: FC<TProps> = ({classValue,
  children,
  ...props
}) => {
  return (
    <label className="relative">
      <input
        type="checkbox"
        className={cx('absolute inset-0', classValue)}
        {...props}
      />
      {children}
    </label>
  );
};
