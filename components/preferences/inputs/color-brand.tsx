import type { FC } from 'react';
import { InputsText } from '@/components/inputs/text';
import { usePreferences } from '@/context/preferences/provider';
import { TPreferencesColorKey } from '@/atom/types';
import { TInputProps } from '@/types/dom/element';
import { NONE_NAME } from '@/atom/constants';
import { InputsSelect } from '@/components/inputs/select';
import { INPUTS_NAME_DELIMITER } from '@/constants/inputs';
import { usePreferencesStateColor } from '@/hooks/color';

const PREFERENCES_INPUTS_COLOR_BRAND_NAME = 'color-brand';

type TProps = Omit<TInputProps, 'name' | 'value'> & {
  name: TPreferencesColorKey;
  value?: string;
};
export const PreferencesInputsColorBrand: FC<TProps> = ({
  name,
  ...props
}) => {
  const preferences = usePreferences();
  const { onColorValueChange, onColorChange } = preferences;

  const {
    selectedBrandRecord,
    onSelectBrandValueChange,
    paintBrands,
    selectedBrandMatchesRecord,
  } = usePreferencesStateColor();

  const value = selectedBrandRecord[name];

  const colors = selectedBrandMatchesRecord[name];

  // console.log(props.value, colors)

  return (
    <div className="flex flex-row justify-end grow gap-1">
      <InputsSelect
        placeholder="Select Brand"
        name={`${PREFERENCES_INPUTS_COLOR_BRAND_NAME}${INPUTS_NAME_DELIMITER}${name}`}
        value={value}
        onValueChange={onSelectBrandValueChange}
        idValues={paintBrands}
      />
      {value === NONE_NAME ||
      !colors ||
      colors.length === 0 ? null : (
        <InputsSelect
          name={name}
          value={props.value}
          onValueChange={(...args) => {
            onColorValueChange(...args);
          }}
          placeholder={props.value ?? 'Select Color'}
          idValues={colors}
        />
      )}
      <InputsText
        name={name}
        classValue="border border-gray-1"
        classPadding="px-6 py-2.5"
        classRounded="rounded-4xl"
        onChange={onColorChange}
        {...props}
      />
    </div>
  );
};
