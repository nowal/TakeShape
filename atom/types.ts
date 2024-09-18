import { PREFERENCES_NAME_BOOLEANS, UPLOAD_STATUS_RECORD } from '@/atom/constants';

export type TPreferencesNameBooleansKey =
  (typeof PREFERENCES_NAME_BOOLEANS)[number];

export type TUploadStatusKey =
  keyof typeof UPLOAD_STATUS_RECORD;
