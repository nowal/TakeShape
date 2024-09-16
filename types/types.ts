import { PREFERENCES_NAME_BOOLEAN_CEILINGS } from '@/atom/constants';
import { TPreferencesNameBooleansKey } from '@/atom/types';

// types.ts
export type Price = {
  painterId: string;
  amount: number;
  invoiceUrl?: string;
  timestamp: number;
  accepted?: boolean;
};

export type UserImage = {
  userImageId: string;
  video?: string;
  prices?: Price[];
  title?: string;
};

export type UserData = {
  email?: string;
  quote?: string | null;
  video?: string;
  reAgent?: string;
  paintPreferencesId?: string;
  userImages?: string[]; // Array of userImage IDs
  prices?: Price[];
  title?: string;
};
export type TPaintPreferencesFlags = Record<
  TPreferencesNameBooleansKey,
  boolean
>;
export type TPaintPreferences = TPaintPreferencesFlags & {
  color?: string;
  finish?: string;
  ceilingColor?: string;
  ceilingFinish?: string;
  trimColor?: string;
  trimFinish?: string;
  paintQuality?: string;
};

export type TimestampPair = {
  startTime: number;
  endTime?: number;
  color?: string;
  finish?: string;
  ceilings?: boolean;
  trim?: boolean;
  roomName: string;
};

export type Job = {
  jobId: string;
  video: string;
  phoneNumber?: string;
  specialRequests?: string;
  paintPreferencesId?: string;
  paintPreferences?: TPaintPreferences;
  providingOwnPaint?: string;
  moveFurniture?: boolean;
  customerName?: string;
  userId?: string;
  address: string;
  lat?: number;
  lng?: number;
  prices: Array<{
    painterId: string;
    amount: number;
    invoiceUrl?: string;
    timestamp: number;
  }>;
  acceptedQuotes?: Array<{
    acceptedQuoteId: string;
  }>;
};
