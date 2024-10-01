import { InputsRadioYesNo } from '@/components/inputs/radio/yes-no';
import { TChangeHandler } from '@/components/inputs/types';
import { InputsRow } from '@/components/inputs/row';
import { TClassValueProps } from '@/types/dom';
import type { FC } from 'react';
export const RADIO_VALUE_YES = 'yes';
export const RADIO_VALUE_NO = 'no';

const SHARED_INPUT_PROPS = {
  type: 'radio',
};
type TProps = TClassValueProps & {
  name: string;
  isChecked: boolean;
  children: string;
  onChange: TChangeHandler;
};
export const InputsRadioYesNoRow: FC<TProps> = ({
  isChecked,
  name,
  children,
  onChange,
  classValue,
}) => {
  return (
    <InputsRow
      input={
        <InputsRadioYesNo
          name={name}
          onChange={onChange}
          yesProps={{
            inputProps: {
              value: RADIO_VALUE_YES,
              checked: isChecked,
              ...SHARED_INPUT_PROPS,
            },
          }}
          noProps={{
            inputProps: {
              value: RADIO_VALUE_NO,
              checked: !isChecked,
              ...SHARED_INPUT_PROPS,
            },
          }}
        />
      }
      classValue={classValue}
    >
      {children}
    </InputsRow>
  );
};
