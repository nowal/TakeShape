import { PREFERENCES_NAME_BOOLEAN_CEILINGS } from '@/atom/constants';
import { InputsSelect } from '@/components/inputs/select';
import { InputsText } from '@/components/inputs/text';
import {
  TChangeHandler,
  TValueChangeHandler,
} from '@/components/inputs/types';
import { PreferencesRow } from '@/components/preferences/row';
import { PreferencesRowYesNo } from '@/components/preferences/row/yes-no';
import { TPaintPreferences } from '@/types/types';
import type { FC } from 'react';

type TProps = Pick<
  TPaintPreferences,
  'ceilingColor' | 'ceilingFinish'
> & {
  isCeilingsPainted: boolean;
  isSelected: boolean;
  onValueChange: TValueChangeHandler;
  onChange: TChangeHandler;
};
export const PreferencesCeilingFields: FC<TProps> = ({
  isCeilingsPainted,
  isSelected,
  onValueChange,
  onChange,
  ...props
}) => {
  return (
    <div className='fill-gray-col'>
      <PreferencesRowYesNo
        name={PREFERENCES_NAME_BOOLEAN_CEILINGS}
        isChecked={isCeilingsPainted}
        onChange={onChange}
      >
        Do you want your ceilings painted?
      </PreferencesRowYesNo>
      {isSelected && (
        <>
          <PreferencesRow
            input={
              <InputsText
                name="ceilingColor"
                placeholder="E.g. white"
                classValue="border border-gray-1"
                classPadding="px-6 py-2.5 rounded-2xl"
                value={props.ceilingColor || 'White'}
                onChange={(event) =>
                  onValueChange(
                    event.currentTarget.name,
                    event.currentTarget.value
                  )
                }
              />
            }
          >
            Ceiling Color
          </PreferencesRow>
          <PreferencesRow
            input={
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
            }
          >
            Ceiling Finish
          </PreferencesRow>
        </>
      )}
    </div>
  );
};
