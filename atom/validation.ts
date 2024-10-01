import { PREFERENCES_COLOR_BRAND_RECORD } from '@/atom/constants';
import { TPreferencesColorKey } from '@/atom/types';

export const isPreferencesColorKey = (
  value: string
): value is TPreferencesColorKey => {
  if (value in PREFERENCES_COLOR_BRAND_RECORD) return true;
  return false;
};
