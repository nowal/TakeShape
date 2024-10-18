import {
  TResolveObjectKeys,
  TResolveObjectEntries,
  TResolveObjectValues,
} from '@/types/object';

export const resolveObjectKeys =
  Object.keys as TResolveObjectKeys;
export const resolveObjectEntries =
  Object.entries as TResolveObjectEntries;
export const resolveObjectValues =
  Object.values as TResolveObjectValues;
