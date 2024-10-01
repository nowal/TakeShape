import type { FC } from 'react';
import { PREFERENCES_NAME_BOOLEAN_MOVE_FURNITURE } from '@/atom/constants';
import { InputsRadioYesNoRow } from '@/components/inputs/radio/yes-no/row';
import { usePreferences } from '@/context/preferences/provider';

export const PreferencesMoveFurniture: FC = () => {
  const preferences = usePreferences();
  const { isMoveFurniture, dispatchMoveFurniture } =
    preferences;
  return (
    <InputsRadioYesNoRow
      name={PREFERENCES_NAME_BOOLEAN_MOVE_FURNITURE}
      isChecked={isMoveFurniture}
      onChange={() => {
        dispatchMoveFurniture((prev) => !prev);
      }}
      classValue="fill-gray-base"
    >
      Will the painters need to move any furniture?
    </InputsRadioYesNoRow>
  );
};
