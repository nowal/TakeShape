import { atom } from 'jotai';
import {
  UserData,
  TimestampPair,
  TPaintPreferences,
} from '../types/types';
import {
  PREFERENCES_NAME_BOOLEAN_CEILINGS,
  PREFERENCES_NAME_BOOLEAN_LABOR_AND_MATERIAL,
  PREFERENCES_NAME_BOOLEAN_TRIM,
} from '@/atom/constants';

export const userDataAtom = atom<UserData | null>(null);
export const isPainterAtom = atom<boolean>(false);
export const checkingAuthAtom = atom<boolean>(true);
export const userTypeLoadingAtom = atom<boolean>(true);
export const painterInfoAtom = atom({
  businessName: '',
  zipCodes: [''],
  isInsured: false,
  logoUrl: '',
  acceptedQuotes: [''],
  phoneNumber: '',
});
export const uploadProgressAtom = atom<number>(0);
export const videoURLAtom = atom<string>('');
export const uploadStatusAtom = atom<
  'idle' | 'uploading' | 'completed' | 'error'
>('idle');
export const documentIdAtom = atom<string | null>(null);
export const timestampPairsAtom = atom<TimestampPair[]>([]);
export const defaultPreferencesAtom =
  atom<TPaintPreferences>({
    color: '',
    finish: '',
    paintQuality: '',
    [PREFERENCES_NAME_BOOLEAN_CEILINGS]: false,
    ceilingColor: '',
    ceilingFinish: '',
    [PREFERENCES_NAME_BOOLEAN_TRIM]: false,
    trimColor: '',
    trimFinish: '',
    [PREFERENCES_NAME_BOOLEAN_LABOR_AND_MATERIAL]: false,
  });
