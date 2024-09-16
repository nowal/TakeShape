import type { FC } from 'react';
import {
  ButtonsCvaInput,
  TButtonsCvaInputProps,
} from '@/components/cva/input';
import { cx } from 'class-variance-authority';

type TProps = {
  name: string;
  onChange: any;
  yesProps: TButtonsCvaInputProps;
  noProps: TButtonsCvaInputProps;
};
export const InputsRadioYesNo: FC<TProps> = ({
  name,
  onChange,
  yesProps,
  noProps,
}) => {
  return (
    <ul className="flex flex-row gap-2">
      {(
        [
          ['Yes', yesProps],
          ['No', noProps],
        ] as const
      ).map(([title, { inputProps, ...restProps }]) => (
        <li key={title}>
          <ButtonsCvaInput
            classValue={cx(
              'relative',
              'font-medium',
              'leading-none',
              'w-[57px]',
              'py-3',
              'text-sm',
              'border border-gray-6 has-[:checked]:border-pink'
            )}
            title={title}
            center
            inputProps={{
              type: 'radio',
              name,
              onChange,
              ...inputProps,
            }}
            rounded="4xl"
            {...restProps}
          >
            {title}
          </ButtonsCvaInput>
        </li>
      ))}
    </ul>
  );
};
