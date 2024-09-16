import { InputsSelect } from '@/components/inputs/select';
import { TValueChangeHandler } from '@/components/inputs/types';
import { LaborAndMaterialsShowFieldsTrimFinish } from '@/components/preferences/options/labor-and-materials/notifications/trim-finish';
import { TPaintPreferences } from '@/types/types';
import type { ChangeEventHandler, FC } from 'react';

type TProps = Pick<
  TPaintPreferences,
  'trimColor' | 'trimFinish'
> & {
  isSelected: boolean;
  isTrimAndDoorsPainted: boolean;
  onValueChange: TValueChangeHandler;
  onChange: ChangeEventHandler<HTMLInputElement>;
};
export const LaborAndMaterialsShowFields: FC<TProps> = ({
  isTrimAndDoorsPainted,
  isSelected,
  trimColor,
  trimFinish,
  onChange,
  onValueChange,
}) => {
  return (
    <>
      <label className="flex items-center gap-2 mt-2 mb-2">
        <input
          type="checkbox"
          name="trim"
          checked={isTrimAndDoorsPainted}
          onChange={onChange}
        />
        Do you want your trim and doors painted?
      </label>

      {isSelected && (
        <div className="extra-fields-row flex justify-between w-full">
          <label className="text-left">
            Trim Color
            <input
              type="text"
              name="trimColor"
              placeholder="Trim Color"
              value={trimColor || 'White'}
              onChange={onChange}
              className="input-field"
            />
          </label>
          <InputsSelect
            placeholder="Trim Finish"
            name="trimFinish"
            value={trimFinish || ''}
            onValueChange={onValueChange}
            values={[
              'Semi-Gloss',
              'Flat',
              'Eggshell',
              'Satin',
              'High Gloss',
            ]}
          />
          {/* <label className="text-left">
          Trim Finish
            <select
              name="trimFinish"
              value={trimFinish || ''}
              onChange={onChange}
              className="input-field select-field"
            >
              <option value="Semi-gloss">Semi-Gloss</option>
              <option value="Flat">Flat</option>
              <option value="Eggshell">Eggshell</option>
              <option value="Satin">Satin</option>
              <option value="High-gloss">High Gloss</option>
            </select>
          </label> */}
          <LaborAndMaterialsShowFieldsTrimFinish />
        </div>
      )}
    </>
  );
};
