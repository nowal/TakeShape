import {
  PAINT_PREFERENCES_DEFAULTS_SEMI_GLOSS,
  PREFERENCES_NAME_BOOLEAN_TRIM,
  PREFERENCES_NAME_STRING_TRIM_FINISH,
} from '@/atom/constants';
import { InputsSelect } from '@/components/inputs/select';
import { InputsText } from '@/components/inputs/text';
import { InputsRow } from '@/components/inputs/row';
import { InputsRadioYesNoRow } from '@/components/inputs/radio/yes-no/row';
import type { FC } from 'react';
import { usePreferences } from '@/context/preferences/provider';
import { PreferencesInputsColorBrand } from '@/components/preferences/inputs/color-brand';

export const PreferencesTrimFields: FC = () => {
  const preferences = usePreferences();
  const {
    isTrimAndDoorsPainted,
    isShowTrimFields,
    isLaborAndMaterials,
    trimColor,
    trimFinish,
    onChange,
    onColorChange,
    onValueChange,
  } = preferences;
  const isSelected =
    isShowTrimFields && isLaborAndMaterials;
  return (
    <div className="fill-gray-col">
      <InputsRadioYesNoRow
        name={PREFERENCES_NAME_BOOLEAN_TRIM}
        isChecked={isTrimAndDoorsPainted}
        onChange={onChange}
      >
        Do you want your trim and doors painted?
      </InputsRadioYesNoRow>
      {isSelected && (
        <>
          <InputsRow // Updated InputsRow for Trim Color
            input={
              <InputsText // Use InputsText instead of PreferencesInputsColorBrand
                name="trimColor" 
                value={trimColor || 'White'}
                onChange={(event) => onColorChange(event)} // Adjust onChange handler
                placeholder="Trim Color" 
              />
            }
          >
            Trim Color
          </InputsRow>
          <InputsRow
            input={
              <InputsSelect
                placeholder="Trim Finish"
                name={PREFERENCES_NAME_STRING_TRIM_FINISH}
                value={trimFinish || ''}
                onValueChange={onValueChange}
                basicValues={[
                  PAINT_PREFERENCES_DEFAULTS_SEMI_GLOSS,
                  'Flat',
                  'Eggshell',
                  'Satin',
                  'High Gloss',
                ]}
              />
            }
          >
            Trim Finish
          </InputsRow>
        </>
      )}
    </div>
  );
};
