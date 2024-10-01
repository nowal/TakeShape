import type { FC } from 'react';
import { InputsSelect } from '@/components/inputs/select';
import { InputsText } from '@/components/inputs/text';
import { usePreferences } from '@/context/preferences/provider';
import { TPreferencesColorKey } from '@/atom/types';
import { TInputProps } from '@/types/dom/element';

type TProps = Omit<TInputProps, 'name'> & {
  name: TPreferencesColorKey;
};
export const PreferencesInputsColorBrand: FC<TProps> = ({
  name,
  ...props
}) => {
  const preferences = usePreferences();
  const {
    selectedBrandRecord,
    onSelectBrandValueChange,
    paintBrands,
    onColorChange,
  } = preferences;

  return (
    <div className="flex flex-row gap-1">
      <InputsSelect
        placeholder="Select Brand"
        name={name}
        value={selectedBrandRecord[name] || ''}
        onValueChange={onSelectBrandValueChange}
        idValues={paintBrands}
      />
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
