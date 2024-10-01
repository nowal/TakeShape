import { PREFERENCES_NAME_BOOLEAN_TRIM } from '@/atom/constants';
import { InputsSelect } from '@/components/inputs/select';
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
          <InputsRow
            input={
              <PreferencesInputsColorBrand
                name="trimColor"
                value={trimColor || 'White'}
                onChange={onColorChange}
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
                name="trimFinish"
                value={trimFinish || ''}
                onValueChange={onValueChange}
                basicValues={[
                  'Semi-Gloss',
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
