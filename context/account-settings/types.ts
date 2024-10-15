import { Dispatch, MutableRefObject } from 'react';
import { useAccountSettingsState } from '@/context/account-settings/state';
import { useAccountSettingsMap } from '@/context/account-settings/map';
import { useAccountSettingsAddress } from '@/context/account-settings/address';
import { useAutoFillAddressGeocode } from '@/hooks/auto-fill/address/geocode';

export type TCoords = { lng: number; lat: number };
export type TCoordsValue = null | TCoords;
export type TMapElement = HTMLDivElement | null;

export type TAccountSettingsConfig = {
  range: number;
  coords: TCoordsValue;
  dispatchCoords: Dispatch<TCoordsValue>;
  address: string;
  dispatchRange: Dispatch<number>;
  dispatchAddress: Dispatch<string>;
  mapElement: TMapElement;
  dispatchMapElement: Dispatch<TMapElement>;
  addressInputRef: MutableRefObject<HTMLInputElement | null>;
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
    TAccountSettingsddressReturn 
    // &
    // TGeocodeAddressContext;

export type TAccountSettingsAddressGeocodeConfig =
  TAccountSettingsConfig & TAccountSettingsMapReturn;

export type TAccountSettingsStateConfig =
  TAccountSettingsMapReturn &
    TAccountSettingsAddressGeocodeConfig 
    // &
    // TGeocodeAddressContext;
