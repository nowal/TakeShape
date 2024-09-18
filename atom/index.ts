import { atom } from 'jotai';
import {
  TUserData,
  TTimestampPair,
  TPaintPreferences,
} from '../types';
import {
  PREFERENCES_NAME_BOOLEAN_CEILINGS,
  PREFERENCES_NAME_BOOLEAN_LABOR_AND_MATERIAL,
  PREFERENCES_NAME_BOOLEAN_TRIM,

} from '@/atom/constants';
import { TUploadStatusKey } from '@/atom/types';

export const userDataAtom = atom<TUserData | null>(null);
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
export const uploadStatusAtom =
  atom<TUploadStatusKey>('idle');
export const documentIdAtom = atom<string | null>(null);
export const timestampPairsAtom = atom<TTimestampPair[]>([]);
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
