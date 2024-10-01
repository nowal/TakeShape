import { PREFERENCES_NAME_BOOLEAN_CEILINGS } from '@/atom/constants';
import { InputsSelect } from '@/components/inputs/select';
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
          <InputsRow
            input={
              <PreferencesInputsColorBrand
                name="ceilingColor"
                value={ceilingColor}
                onChange={onColorChange}
                placeholder="Select Ceiling Color"
              />
              // <InputsText
              //   name="ceilingColor"
              //   placeholder="E.g. white"
              //   classValue="border border-gray-1"
              //   classPadding="px-6 py-2.5"
              //   classRounded="rounded-4xl"
              // />
            }
          >
            Ceiling Color
          </InputsRow>
          <InputsRow
            input={
              <InputsSelect
                placeholder="Ceiling Finish"
                name="ceilingFinish"
                value={ceilingFinish || ''}
                onValueChange={onValueChange}
                basicValues={[
                  'Flat',
                  'Eggshell',
                  'Satin',
                  'Semi-Gloss',
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
