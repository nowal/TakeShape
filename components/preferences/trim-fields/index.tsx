import { PREFERENCES_NAME_BOOLEAN_TRIM } from '@/atom/constants';
import { InputsSelect } from '@/components/inputs/select';
import { InputsText } from '@/components/inputs/text';
import {
  TChangeHandler,
  TValueChangeHandler,
} from '@/components/inputs/types';
import { PreferencesRow } from '@/components/preferences/row';
import { PreferencesRowYesNo } from '@/components/preferences/row/yes-no';
import { TPaintPreferences } from '@/types';
import type { FC } from 'react';

type TProps = Pick<
  TPaintPreferences,
  'trimColor' | 'trimFinish'
> & {
  isSelected: boolean;
  isTrimAndDoorsPainted: boolean;
  onValueChange: TValueChangeHandler;
  onChange: TChangeHandler;
};
export const PreferencesTrimFields: FC<TProps> = ({
  isTrimAndDoorsPainted,
  isSelected,
  trimColor,
  trimFinish,
  onChange,
  onValueChange,
}) => {
  return (
    <div className="fill-gray-col">
      <PreferencesRowYesNo
        name={PREFERENCES_NAME_BOOLEAN_TRIM}
        isChecked={isTrimAndDoorsPainted}
        onChange={onChange}
      >
        Do you want your trim and doors painted?
      </PreferencesRowYesNo>
      {isSelected && (
        <>
          <PreferencesRow
            input={
              <InputsText
                classValue="border border-gray-1"
                classPadding="px-6 py-2.5 rounded-2xl"
                name="trimColor"
                placeholder="Trim Color"
                value={trimColor || 'White'}
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
                placeholder="Trim Finish"
                name="trimFinish"
                value={trimFinish || ''}
                onValueChange={onValueChange}
                basicValues={[
                  'Semi-Gloss',
                  'Flat',
                  'Eggshell',
                  'Satin',
                  'High Gloss',
                ]}
              />
            }
          >
            Ceiling Color
          </PreferencesRow>

          {/* <PreferencesNotificationsTrimFinish /> */}
        </>
      )}
    </div>
  );
};
