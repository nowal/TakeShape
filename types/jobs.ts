import { TPaintPreferences } from '@/types/preferences';

type TJobPrice = {
  painterId: string;
  amount: number;
  invoiceUrl?: string;
  timestamp: number;
};
export type TJobPrices = TJobPrice[];
type TAcceptedQuote = {
  acceptedQuoteId: string;
};
export type TJob = {
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
  prices: TJobPrices;
  laborAndMaterial?: boolean;
  acceptedQuotes?: TAcceptedQuote[];
};
export type TUnfilteredJob = TJob | undefined;
export type TJobs = TJob[];
export type TUnfilteredJobs = TUnfilteredJob[];
