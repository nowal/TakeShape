import { TPreferencesNameBooleansKey } from '@/atom/types';

// types.ts
export type TPrice = {
  painterId: string;
  amount: number;
  invoiceUrl?: string;
  timestamp: number;
  accepted?: boolean;
};

export type TUserImageRecord = {
  userImageId: string;
  video?: string;
  prices?: TPrice[];
  title?: string;
};

export type TJobUserData = Pick<
  TJob,
  | 'moveFurniture'
  | 'specialRequests'
  | 'laborAndMaterial'
>;
export type TUserData = TJobUserData & {
  email?: string;
  quote?: string | null;
  video?: string;
  reAgent?: string;
  paintPreferencesId?: string;
  paintPreferences?: TPaintPreferences;
  userImages?: string[]; // Array of userImage IDs
  prices?: TPrice[];
  title?: string;
};
export type TPaintPreferencesFlags = Record<
  TPreferencesNameBooleansKey,
  boolean
>;
export type TPaintPreferences =
  Partial<TPaintPreferencesFlags> & {
    color?: string;
    finish?: string;
    ceilingColor?: string;
    ceilingFinish?: string;
    trimColor?: string;
    trimFinish?: string;
    paintQuality?: string;
  };
export type TAgentInfo = {
  name: string;
  profilePictureUrl: string;
  preferredPainters: string[];
} | null;

export type TPainterInviteData = {
  name: string;
  phoneNumber: string;
  agentId: string;
};
export type TTimestampPair = {
  startTime: number;
  endTime?: number;
  color?: string;
  finish?: string;
  ceilings?: boolean;
  trim?: boolean;
  roomName: string;
  paintCeilings?: boolean;
  paintTrimAndDoors?: boolean;
  dontPaintAtAll?: boolean;
};
type TJobPrice = {
  painterId: string;
  amount: number;
  invoiceUrl?: string;
  timestamp: number;
};
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
  prices: TJobPrice[];
  laborAndMaterial?: boolean;
  acceptedQuotes?: TAcceptedQuote[];
};

export type TSelectIdTitleItem = {
  id: string;
  title: string;
};

export type TSelectIdNameItem = {
  id: string;
  name: string;
  count?: number;
};

export type TSelectNameColorItem = {
  hex: string;
  name: 'NSU - Bernsteinrot / 303';
};

export type TSelectIdItems =
  | TSelectIdTitleItem[]
  | TSelectIdNameItem[]
  | TSelectNameColorItem[]
  | readonly TSelectIdTitleItem[]
  | readonly TSelectIdNameItem[]
  | readonly TSelectNameColorItem[];

export type TUserImage = TSelectIdTitleItem;

export type TAcceptQuoteHandler = (
  painterId: string,
  price: number
) => Promise<void>;

export type TQuoteChangeHandler = (
  userImageId: string
) => Promise<void>;
