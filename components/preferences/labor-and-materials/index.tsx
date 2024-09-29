import { InputsSelect } from '@/components/inputs/select';
import { InputsText } from '@/components/inputs/text';
import { TValueChangeHandler } from '@/components/inputs/types';
import { LinesHorizontal } from '@/components/lines/horizontal';
import { PreferencesRow } from '@/components/preferences/row';
import { TPaintPreferences } from '@/types';
import type { ChangeEventHandler, FC } from 'react';

type TProps = Pick<
  TPaintPreferences,
  'color' | 'finish' | 'paintQuality'
> & {
  onChange: ChangeEventHandler<HTMLInputElement>;
  onValueChange: TValueChangeHandler;
};
export const PreferencesLaborAndMaterials: FC<TProps> = ({
  onValueChange,
  ...props
}) => {
  
  return (
    <div className="flex flex-col items-stretch fill-gray-base">
      <PreferencesRow
        input={
          <InputsText
            name="color"
            placeholder="E.g. white"
            classValue="border border-gray-1"
            classPadding="px-6 py-2.5"
            classRounded="rounded-4xl"
            value={props.color || ''}
            onChange={props.onChange}
          />
        }
      >
        Wall Color
      </PreferencesRow>
      <LinesHorizontal colorClass="border-gray-10" />
      {/* <InputsColorPickerInputControlled
            name="color"
            value={props.color || ''}
            onValueChange={onValueChange}
          /> */}
      <PreferencesRow
        input={
          <InputsSelect
            placeholder="Wall finish"
            name="finish"
            value={props.finish || ''}
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
      </PreferencesRow>
      <LinesHorizontal colorClass="border-gray-10" />
      <PreferencesRow
        input={
          <InputsSelect
            placeholder="Paint Quality"
            name="paintQuality"
            value={props.paintQuality || ''}
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
      </PreferencesRow>
    </div>
  );
};
