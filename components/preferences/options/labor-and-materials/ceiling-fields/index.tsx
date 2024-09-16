import { InputsColorPickerInputControlled } from '@/components/inputs/color-picker/controlled';
import { InputsColorPickerInput } from '@/components/inputs/color-picker/input';
import { InputsSelect } from '@/components/inputs/select';
import { InputsText } from '@/components/inputs/text';
import { TValueChangeHandler } from '@/components/inputs/types';
import { TPaintPreferences } from '@/types/types';
import type { ChangeEventHandler, FC } from 'react';

type TProps = Pick<
  TPaintPreferences,
  'ceilingColor' | 'ceilingFinish'
> & {
  isCeilingsPainted: boolean;
  isSelected: boolean;
  onValueChange: TValueChangeHandler;
};
export const LaborAndMaterialsCeilingFields: FC<TProps> = ({
  isSelected,
  onValueChange,
  ...props
}) => {
  return (
    <>
      {/* <label className="flex items-center gap-2 mb-2">
        <input
          type="checkbox"
          name="ceilings"
          checked={props.isCeilingsPainted}
          onChange={props.onChange}
        />
      </label> */}
      <div>Do you want your ceilings painted?</div>
      {isSelected && (
        <div className="extra-fields-row flex justify-between w-full">
          {/* <label className="text-left">
            Ceiling Color
            <input
              type="text"
              name="ceilingColor"
              placeholder="Ceiling Color"
              value={props.ceilingColor || 'White'}
              onChange={props.onChange}
              className="input-field"
            />
          </label> */}
          <InputsColorPickerInputControlled
            name="ceilingColor"
            value={props.ceilingColor || 'White'}
            onValueChange={onValueChange}
          />
          <InputsText
            type="text"
            name="ceilingColor"
            placeholder="Ceiling Color"
            value={props.ceilingColor || 'White'}
            onChange={(event) =>
              onValueChange(
                event.currentTarget.name,
                event.currentTarget.value
              )
            }
            className="input-field"
          />
          <InputsSelect
            placeholder="Ceiling Finish"
            name="ceilingFinish"
            value={props.ceilingFinish || ''}
            onValueChange={onValueChange}
            values={[
              'Flat',
              'Eggshell',
              'Satin',
              'Semi-Gloss',
              'High Gloss',
            ]}
          />
        </div>
      )}
    </>
  );
};
