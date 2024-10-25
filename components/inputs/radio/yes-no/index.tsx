import type { FC } from 'react';
import {
  CvaInput,
  TCvaInputProps,
} from '@/components/cva/input';
import { cx } from 'class-variance-authority';

type TProps = {
  name: string;
  onChange: any;
  yesProps: TCvaInputProps;
  noProps: TCvaInputProps;
};
export const InputsRadioYesNo: FC<TProps> = (props) => {
  const { name, onChange, yesProps, noProps } = props;
  return (
    <ul className="flex flex-row gap-2">
      {(
        [
          ['Yes', yesProps],
          ['No', noProps],
        ] as const
      ).map(([title, { inputProps, ...restProps }]) => {
        return (
          <li key={title}>
            <CvaInput
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
                classValue: 'cursor-pointer',
                ...inputProps,
              }}
              rounded="4xl"
              {...restProps}
            >
              {title}
            </CvaInput>
          </li>
        );
      })}
    </ul>
  );
};
