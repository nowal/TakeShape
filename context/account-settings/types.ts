import { Dispatch, MutableRefObject } from 'react';
import { useAccountSettingsState } from '@/context/account-settings/state';
import { useAccountSettingsMap } from '@/context/account-settings/map';

export type TAccountSettingsConfig = {
  address: string;
  dispatchAddress: Dispatch<string>;
  addressInputRef: MutableRefObject<HTMLInputElement | null>;
  mapRef: MutableRefObject<HTMLDivElement | null>;
};

export type TAccountSettingsStateReturn = ReturnType<
  typeof useAccountSettingsState
>;


export type TAccountSettingsMapReturn = ReturnType<
  typeof useAccountSettingsMap
>;

export type TAccountSettingsContext =
  TAccountSettingsStateReturn & TAccountSettingsMapReturn & TAccountSettingsConfig;


export type TAccountSettingsStateConfig =
  TAccountSettingsConfig & TAccountSettingsMapReturn;
