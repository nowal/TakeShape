import { atom } from 'jotai';
import {
  TUserData,
  TTimestampPair,
  TPaintPreferences,
} from '../types';
import { PAINT_PREFERENCES_DEFAULTS } from '@/atom/constants';
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
export const timestampPairsAtom = atom<TTimestampPair[]>(
  []
);
export const defaultPreferencesAtom =
  atom<TPaintPreferences>({
    ...PAINT_PREFERENCES_DEFAULTS,
  });
