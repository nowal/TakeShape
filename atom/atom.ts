import { atom } from 'jotai';
import { UserData, TimestampPair, PaintPreferences } from '../types/types';

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
export const uploadStatusAtom = atom<'idle' | 'uploading' | 'completed' | 'error'>('idle');
export const documentIdAtom = atom<string | null>(null);
export const timestampPairsAtom = atom<TimestampPair[]>([]);
export const defaultPreferencesAtom = atom<PaintPreferences>({
  color: '',
  finish: '',
  paintQuality: '',
  ceilings: false,
  ceilingColor: '',
  ceilingFinish:'',
  trim: false,
  trimColor:'',
  trimFinish:'',
  laborAndMaterial:false,
});
