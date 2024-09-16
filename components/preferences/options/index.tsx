import type { FC } from 'react';
import { InputsRadioYesNo } from '@/components/inputs/radio/yes-no';
import {
  PREFERENCES_NAME_BOOLEAN_CEILINGS,
  PREFERENCES_NAME_BOOLEAN_LABOR_AND_MATERIAL,
  PREFERENCES_NAME_BOOLEAN_TRIM,
} from '@/atom/constants';

type TProps = {
  isCeilingsPainted: boolean;
  isTrimAndDoorsPainted: boolean;
  isMoveFurniture: boolean;
  onChange: any;
};
export const DefaultPreferencesOptions: FC<TProps> = ({
  isCeilingsPainted,
  isMoveFurniture,
  isTrimAndDoorsPainted,
  onChange,
}) => {
  return (
    <ul className="flex flex-col gap-2.5 w-full">
      {(
        [
          [
            PREFERENCES_NAME_BOOLEAN_CEILINGS,
            isCeilingsPainted,
            'Do you want your ceilings painted?',
          ],
          [
            PREFERENCES_NAME_BOOLEAN_TRIM,
            isTrimAndDoorsPainted,
            'Do you want your trim and doors painted?',
          ],
          [
            PREFERENCES_NAME_BOOLEAN_LABOR_AND_MATERIAL,
            isMoveFurniture,
            'Will the painters need to move any furniture?',
          ],
        ] as const
      ).map(([name, isChecked, text]) => (
        <li
          className="relative fill-row-gray w-full"
          key={text}
        >
          <span>{text}</span>
          <InputsRadioYesNo
            name={name}
            onChange={onChange}
            yesProps={{
              inputProps: {
                type: 'radio',
                checked: isChecked,
              },
            }}
            noProps={{
              inputProps: {
                type: 'radio',
                checked: !isChecked,
              },
            }}
          />
        </li>
      ))}
    </ul>
  );
};
