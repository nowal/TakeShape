import { InputsColorPickerInputControlled } from '@/components/inputs/color-picker/controlled';
import { InputsSelect } from '@/components/inputs/select';
import { InputsText } from '@/components/inputs/text';
import { TValueChangeHandler } from '@/components/inputs/types';
import { OptionsLaborAndMaterialsNotificationsColorField } from '@/components/preferences/options/labor-and-materials/notifications/color-field';
import { TPaintPreferences } from '@/types/types';
import type { ChangeEventHandler, FC } from 'react';

type TProps = Pick<
  TPaintPreferences,
  'color' | 'finish' | 'paintQuality'
> & {
  onChange: ChangeEventHandler<HTMLInputElement>;
  onValueChange: TValueChangeHandler;
};
export const OptionsLaborAndMaterials: FC<TProps> = ({
  onValueChange,
  ...props
}) => {
  return (
    <div className="flex flex-col items-center gap-2 mb-6">
      <div className="flex justify-between w-full">
        <div className="flex flex-col">
          <div>Wall Color</div>
          <InputsText
            type="text"
            name="color"
            placeholder="E.g. white"
            classValue="border border-gray-1 rounded-xl"
            value={props.color || ''}
            onChange={props.onChange}
          />
          <InputsColorPickerInputControlled
            name="color"
            value={props.color || ''}
            onValueChange={onValueChange}
          />
        </div>
        <InputsSelect
          placeholder="Wall finish"
          name="finish"
          value={props.finish || ''}
          onValueChange={onValueChange}
          values={[
            'Eggshell',
            'Flat',
            'Satin',
            'Semi-Gloss',
            'High Gloss',
          ]}
        />
        <OptionsLaborAndMaterialsNotificationsColorField />
        {/* <label className="text-left">
        Wall finish
          <select
            name="finish"
            value={props.finish || ''}
            onChange={props.onChange}
            className="input-field select-field"
          >
            <option value="Eggshell">Eggshell</option>
            <option value="Flat">Flat</option>
            <option value="Satin">Satin</option>
            <option value="Semi-gloss">Semi-Gloss</option>
            <option value="High-gloss">High Gloss</option>
          </select>
        </label> */}

        <InputsSelect
          placeholder="Paint Quality"
          name="paintQuality"
          value={props.paintQuality || ''}
          onValueChange={(value) => props.onChange}
          values={[
            'Medium Quality',
            'Budget Quality',
            'High Quality',
          ]}
        />
        {/* <label className="text-left">
        Paint Quality
        <select
          name="paintQuality"
          value={props.paintQuality || ''}
          onChange={props.onChange}
          className="input-field select-field"
        >
          <option value="Medium">Medium Quality</option>
          <option value="Budget">Budget Quality</option>
          <option value="High">High Quality</option>
        </select>
      </label> */}
      </div>
    </div>
  );
};
