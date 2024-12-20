import {
  PAINT_PREFERENCES_DEFAULTS_SEMI_GLOSS,
  PREFERENCES_NAME_BOOLEAN_CEILINGS,
  PREFERENCES_NAME_STRING_CEILING_COLOR,
  PREFERENCES_NAME_STRING_CEILING_FINISH,
} from '@/atom/constants';
import { InputsSelect } from '@/components/inputs/select';
import { InputsText } from '@/components/inputs/text';
import { InputsRow } from '@/components/inputs/row';
import type { FC } from 'react';
import { InputsRadioYesNoRow } from '@/components/inputs/radio/yes-no/row';
import { usePreferences } from '@/context/preferences/provider';
import { PreferencesInputsColorBrand } from '@/components/preferences/inputs/color-brand';

export const PreferencesCeilingFields: FC = () => {
  const preferences = usePreferences();
  const {
    ceilingColor,
    ceilingFinish,
    isCeilingsPainted,
    isShowCeilingFields,
    isLaborAndMaterials,
    onValueChange,
    onColorChange,
    onChange,
  } = preferences;
  const isSelected =
    isShowCeilingFields && isLaborAndMaterials;
  return (
    <div className="fill-gray-col">
      <InputsRadioYesNoRow
        name={PREFERENCES_NAME_BOOLEAN_CEILINGS}
        isChecked={isCeilingsPainted}
        onChange={onChange}
      >
        Do you want your ceilings painted?
      </InputsRadioYesNoRow>
      {isSelected && (
        <>
          <InputsRow // Updated InputsRow for Ceiling Color
            input={
              <InputsText // Use InputsText instead of PreferencesInputsColorBrand
                name={PREFERENCES_NAME_STRING_CEILING_COLOR}
                value={ceilingColor || 'White'}
                onChange={(event) => onColorChange(event)} // Adjust onChange handler
                placeholder="Ceiling Color" 
              />
            }
          >
            Ceiling Color
          </InputsRow>
          <InputsRow
            input={
              <InputsSelect
                placeholder="Ceiling Finish"
                name={
                  PREFERENCES_NAME_STRING_CEILING_FINISH
                }
                value={ceilingFinish}
                onValueChange={onValueChange}
                basicValues={[
                  'Flat',
                  'Eggshell',
                  'Satin',
                  PAINT_PREFERENCES_DEFAULTS_SEMI_GLOSS,
                  'High Gloss',
                ]}
              />
            }
          >
            Ceiling Finish
          </InputsRow>
        </>
      )}
    </div>
  );
};
