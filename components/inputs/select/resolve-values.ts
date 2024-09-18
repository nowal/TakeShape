import { TSelectValues } from '@/components/inputs/select/types';
import { TSelectIdTitleItem } from '@/types/types';

export type TResolveValuesConfig = {
  basicValues?: TSelectValues;
  idValues?: TSelectIdTitleItem[];
};
export const resolveValues = (
  config: TResolveValuesConfig
): TSelectIdTitleItem[] => {
  const basicToIdValues: TSelectIdTitleItem[] = (
    config.basicValues ?? []
  ).map((value) => ({
    id: value,
    title: value,
  }));
  return [...basicToIdValues, ...(config.idValues ?? [])];
};
