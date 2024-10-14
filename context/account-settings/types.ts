import { Dispatch, MutableRefObject } from 'react';
import { useAccountSettingsState } from '@/context/account-settings/state';
import { useAccountSettingsMap } from '@/context/account-settings/map';
import { useAccountSettingsAddress } from '@/context/account-settings/address';
import { useAutoFillAddressGeocode } from '@/hooks/auto-fill/address/geocode';

export type TCoords = { lng: number; lat: number };
export type TCoordsValue = null | TCoords;

export type TAccountSettingsConfig = {
  coords: TCoordsValue;
  dispatchCoords: Dispatch<TCoordsValue>;
  address: string;
  dispatchAddress: Dispatch<string>;
  addressInputRef: MutableRefObject<HTMLInputElement | null>;
  mapElementRef: MutableRefObject<HTMLDivElement | null>;
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
export type TAutoFillAddressGeocode = ReturnType<
  typeof useAutoFillAddressGeocode
>;

export type TGeocodeAddressContext = {
  onGeocodeAddress: TAutoFillAddressGeocode;
};

export type TAccountSettingsContext =
  TAccountSettingsStateReturn &
    TAccountSettingsMapReturn &
    TAccountSettingsConfig &
    TAccountSettingsddressReturn &
    TGeocodeAddressContext;

export type TAccountSettingsAddressGeocodeConfig =
  TAccountSettingsConfig & TAccountSettingsMapReturn;

export type TAccountSettingsStateConfig =
  TAccountSettingsMapReturn &
    TAccountSettingsAddressGeocodeConfig &
    TGeocodeAddressContext;
