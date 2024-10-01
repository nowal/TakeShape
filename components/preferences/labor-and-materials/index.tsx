import { InputsSelect } from '@/components/inputs/select';
import { LinesHorizontal } from '@/components/lines/horizontal';
import { InputsRow } from '@/components/inputs/row';
import { usePreferences } from '@/context/preferences/provider';
import type { FC } from 'react';
import { PreferencesInputsColorBrand } from '@/components/preferences/inputs/color-brand';

export const PreferencesLaborAndMaterials: FC = () => {
  const preferences = usePreferences();
  const {
    paintQuality,
    finish,
    color,
    onColorChange,
    onValueChange,
  } = preferences;
  return (
    <div className="flex flex-col items-stretch fill-gray-base">
      <InputsRow
        input={
          <PreferencesInputsColorBrand
            name="color"
            value={color}
            onChange={onColorChange}
            placeholder="Wall Color"
          />
          // <div className="flex flex-row gap-1">
          //   <InputsSelect
          //     placeholder="Select Brand"
          //     name="color"
          //     value={selectedBrandRecord.color || ''}
          //     onValueChange={onSelectBrand}
          //     idValues={paintBrands}
          //   />
          //   <InputsText
          //     name="color"
          //     placeholder="E.g. white"
          //     classValue="border border-gray-1"
          //     classPadding="px-6 py-2.5"
          //     classRounded="rounded-4xl"
          //     value={color || ''}
          //     onChange={onColorChange}
          //   />
          // </div>
        }
      >
        Wall Color
      </InputsRow>
      <LinesHorizontal colorClass="border-gray-10" />
      <InputsRow
        input={
          <InputsSelect
            placeholder="Wall finish"
            name="finish"
            value={finish || ''}
            onValueChange={onValueChange}
            basicValues={[
              'Eggshell',
              'Flat',
              'Satin',
              'Semi-Gloss',
              'High Gloss',
            ]}
          />
        }
      >
        Wall finish
      </InputsRow>
      <LinesHorizontal colorClass="border-gray-10" />
      <InputsRow
        input={
          <InputsSelect
            placeholder="Select Paint Quality"
            name="paintQuality"
            value={paintQuality}
            onValueChange={onValueChange}
            basicValues={[
              'Medium Quality',
              'Budget Quality',
              'High Quality',
            ]}
          />
        }
      >
        Paint Quality
      </InputsRow>
    </div>
  );
};
