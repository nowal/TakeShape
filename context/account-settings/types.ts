import { Dispatch, MutableRefObject } from 'react';
import { useAccountSettingsState } from '@/context/account-settings/state';
import { useAccountSettingsMap } from '@/context/account-settings/map';
import { useAccountSettingsAddress } from '@/context/account-settings/address';

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
export type TAccountSettingsddressReturn = ReturnType<
  typeof useAccountSettingsAddress
>;
export type TAccountSettingsContext =
  TAccountSettingsStateReturn &
    TAccountSettingsMapReturn &
    TAccountSettingsConfig &
    TAccountSettingsddressReturn;

export type TAccountSettingsStateConfig =
  TAccountSettingsConfig & TAccountSettingsMapReturn;
