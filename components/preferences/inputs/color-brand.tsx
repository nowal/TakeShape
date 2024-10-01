import type { FC } from 'react';
import { InputsSelect } from '@/components/inputs/select';
import { InputsText } from '@/components/inputs/text';
import { usePreferences } from '@/context/preferences/provider';
import { TPreferencesColorKey } from '@/atom/types';
import { TInputProps } from '@/types/dom/element';
import { INPUTS_NAME_DELIMITER } from '@/constants/inputs';
import { NONE_NAME } from '@/atom/constants';

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
  const {
    selectedBrandRecord,
    selectedBrandMatchesRecord,
    onSelectBrandValueChange,
    paintBrands,
    onColorChange,
    onColorValueChange,
  } = preferences;

  const value = selectedBrandRecord[name];

  const colors = selectedBrandMatchesRecord[name];

  console.log(colors, props.value);

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
      colors.length === 0 ? (
        <InputsText
          name={name}
          classValue="border border-gray-1"
          classPadding="px-6 py-2.5"
          classRounded="rounded-4xl"
          onChange={onColorChange}
          {...props}
        />
      ) : (
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
    </div>
  );
};
