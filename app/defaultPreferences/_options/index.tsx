import type { FC } from 'react';
import { InputsRadioYesNo } from '@/components/inputs/radio/yes-no';

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
            'ceilings-painted',
            isCeilingsPainted,
            'Do you want your ceilings painted?',
          ],
          [
            'trim-and-doors-painted',
            isTrimAndDoorsPainted,
            'Do you want your trim and doors painted?',
          ],
          [
            'move-furniture',
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
