import { TSelectValues } from '@/components/inputs/select/types';
import {
  TSelectIdItems,
  TSelectIdTitleItem,
} from '@/types';

export type TResolveValuesConfig = {
  basicValues?: TSelectValues;
  idValues?: TSelectIdItems;
};
export const resolveValues = (
  config: TResolveValuesConfig
): TSelectIdItems => {
  if (config.basicValues) {
    const basicToIdValues: TSelectIdTitleItem[] = (
      config.basicValues ?? []
    ).map((value) => ({
      id: value.toString(),
      title: value.toString(),
    }));
    if (basicToIdValues) return basicToIdValues;
  }

  return config.idValues ?? [];
};
