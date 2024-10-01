import {
  PREFERENCES_COLOR_BRAND_RECORD,
  PREFERENCES_NAME_BOOLEANS,
  PREFERENCES_NAME_STRING_COLORS,
  UPLOAD_STATUS_RECORD,
} from '@/atom/constants';

export type TPreferencesNameBooleansKey =
  (typeof PREFERENCES_NAME_BOOLEANS)[number];

export type TUploadStatusKey =
  keyof typeof UPLOAD_STATUS_RECORD;

export type TPreferencesColorKey =
  keyof typeof PREFERENCES_COLOR_BRAND_RECORD;
