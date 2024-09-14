import type { FC } from 'react';
import {
  ButtonsCvaInput,
  TButtonsCvaInputProps,
} from '@/components/cva/input';

type TProps = {
  name: string;
  yesProps: TButtonsCvaInputProps;
  noProps: TButtonsCvaInputProps;
};
export const InputsRadioYesNo: FC<TProps> = ({
  name,
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
            // classValue="has-[:checked]:bg-indigo-50"
            // inputProps={{
            //   type: 'radio',
            //   checked: laborAndMaterial === true,
            //   onChange: () =>
            //     handleLaborMaterialChange(true),
            //   // className: 'form-checkbox',
            // }}
            title={title}
            inputProps={{ name, ...inputProps }}
            {...restProps}
          >
            {title}
          </ButtonsCvaInput>
        </li>
      ))}
    </ul>
  );
};
