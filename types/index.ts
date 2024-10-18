import { TJob } from '@/types/jobs';
import { TPaintPreferences } from '@/types/preferences';

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
  'moveFurniture' | 'specialRequests' | 'laborAndMaterial'
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
