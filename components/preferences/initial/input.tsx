import {
  CvaInput,
  TCvaInputProps,
} from '@/components/cva/input';
import { TCommonIconFC } from '@/components/icon';
import { cx } from 'class-variance-authority';
import type { FC } from 'react';

type TProps = {
  Icon: TCommonIconFC;
  value: string;
  isChecked: boolean;
  onChange(isChecked: boolean): void;
} & TCvaInputProps;
export const PreferencesInitialInput: FC<TProps> = ({
  Icon,
  value,
  isChecked,
  onChange,
  ...props
}) => {
  const { children, inputProps, ...restProps } = props;
  return (
    <li className="grow w-full relative">
      <CvaInput
        icon={{ Leading: Icon }}
        classValue={cx(
          'gap-4',
          'w-full p-5 rounded-lg',
          'border border-white-4 cursor-pointer',
          'has-[:checked]:border-pink',
          'has-[:checked]:text-pink',
          'has-[:checked]:shadow-pink-bottom-08'
        )}
        inputProps={{
          value,
          checked: isChecked,
          onChange,
          ...inputProps,
        }}
        {...restProps}
      >
        {children}
      </CvaInput>
    </li>
  );
};
