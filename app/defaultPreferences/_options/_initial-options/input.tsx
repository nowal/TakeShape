import {
  ButtonsCvaInput,
  TButtonsCvaInputProps,
} from '@/components/cva/input';
import { TCommonIconFC } from '@/components/icon';
import { cx } from 'class-variance-authority';
import type { FC } from 'react';

type TProps = {
  Icon: TCommonIconFC;
  value: string;
  isChecked: boolean;
  onChange(isChecked: boolean): void;
} & TButtonsCvaInputProps;
export const DefaultPreferencesInitialOptionsInput: FC<
  TProps
> = ({ Icon, value, isChecked, ...props }) => {
  const { children, inputProps, ...restProps } = props;
  console.log(inputProps)
  return (
    <li className="w-full grow relative">
      <ButtonsCvaInput
        icon={{ Leading: Icon }}
        classValue={cx(
          'w-full p-5',
          'border border-transparent cursor-pointer',
          'has-[:checked]:border-pink has-[:checked]:bg-indigo-50',
        )}
        inputProps={{
          value: 'labor',
          checked: isChecked,
          ...inputProps,
        }}
        {...restProps}
      >
        {children}
      </ButtonsCvaInput>
    </li>
  );
};
