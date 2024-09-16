import { InputsColorPickerInput } from '@/components/inputs/color-picker/input';
import { TControlledInputProps } from '@/components/inputs/types';
import type { ChangeEventHandler, FC } from 'react';

type TProps = TControlledInputProps;
export const InputsColorPickerInputControlled: FC<TProps> = ({
  onValueChange,
  value,
  ...props
}) => {
  const handleChange: ChangeEventHandler<
    HTMLInputElement
  > = ({ currentTarget: { name, value } }) => {
    onValueChange(name, value);
  };
  return (
    <InputsColorPickerInput
      colorValue={value}
      onChange={handleChange}
      {...props}
    />
  );
};
