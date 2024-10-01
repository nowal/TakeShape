import {
  PREFERENCES_NAME_STRING_COLOR,
  PREFERENCES_NAME_STRING_FINISH,
  PREFERENCES_NAME_STRING_PAINT_QUALITY,
  PREFERENCES_NAME_STRING_CEILING_COLOR,
  PREFERENCES_NAME_STRING_CEILING_FINISH,
  PREFERENCES_NAME_STRING_TRIM_COLOR,
  PREFERENCES_NAME_STRING_TRIM_FINISH,
} from '@/atom/constants';
import { TPreferencesNameBooleansKey } from '@/atom/types';
import { TPaintPreferences } from '@/types';

type TConfig = { defaultPreferences: TPaintPreferences } & {
  preferencesFlags: Pick<
    TPaintPreferences,
    TPreferencesNameBooleansKey
  >;
};
export const resolvePreferencesCurrent = ({
  defaultPreferences,
  preferencesFlags,
}: TConfig): TPaintPreferences => {
  return {
    [PREFERENCES_NAME_STRING_COLOR]:
      (
        document.getElementsByName(
          PREFERENCES_NAME_STRING_COLOR
        )[0] as HTMLInputElement
      )?.value ||
      defaultPreferences[PREFERENCES_NAME_STRING_COLOR],
    [PREFERENCES_NAME_STRING_FINISH]:
      (
        document.getElementsByName(
          PREFERENCES_NAME_STRING_FINISH
        )[0] as HTMLSelectElement
      )?.value ||
      defaultPreferences[PREFERENCES_NAME_STRING_FINISH],
    [PREFERENCES_NAME_STRING_PAINT_QUALITY]:
      (
        document.getElementsByName(
          PREFERENCES_NAME_STRING_PAINT_QUALITY
        )[0] as HTMLSelectElement
      )?.value ||
      defaultPreferences[
        PREFERENCES_NAME_STRING_PAINT_QUALITY
      ],

    [PREFERENCES_NAME_STRING_CEILING_COLOR]:
      (
        document.getElementsByName(
          PREFERENCES_NAME_STRING_CEILING_COLOR
        )[0] as HTMLInputElement
      )?.value ||
      defaultPreferences[
        PREFERENCES_NAME_STRING_CEILING_COLOR
      ],
    [PREFERENCES_NAME_STRING_CEILING_FINISH]:
      (
        document.getElementsByName(
          PREFERENCES_NAME_STRING_CEILING_FINISH
        )[0] as HTMLSelectElement
      )?.value ||
      defaultPreferences[
        PREFERENCES_NAME_STRING_CEILING_FINISH
      ],
    [PREFERENCES_NAME_STRING_TRIM_COLOR]:
      (
        document.getElementsByName(
          PREFERENCES_NAME_STRING_TRIM_COLOR
        )[0] as HTMLInputElement
      )?.value ||
      defaultPreferences[
        PREFERENCES_NAME_STRING_TRIM_COLOR
      ],
    [PREFERENCES_NAME_STRING_TRIM_FINISH]:
      (
        document.getElementsByName(
          PREFERENCES_NAME_STRING_TRIM_FINISH
        )[0] as HTMLSelectElement
      )?.value ||
      defaultPreferences[
        PREFERENCES_NAME_STRING_TRIM_FINISH
      ],
    ...preferencesFlags,
  };
};
