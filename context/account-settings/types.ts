import { Dispatch, MutableRefObject } from 'react';
import { useAccountSettingsState } from '@/context/account-settings/state';
import { useAccountSettingsAddress } from '@/context/account-settings/address';
import { useAddressGeocodeHandler } from '@/hooks/address/geocode';

export type TCoords = { lng: number; lat: number };
export type TCoordsValue = null | TCoords;

export type TAccountSettingsddressReturn = ReturnType<
  typeof useAccountSettingsAddress
>;
export type TAddressGeocodeHandler = ReturnType<
  typeof useAddressGeocodeHandler
>;

export type TAccountSettingsConfig =
  TAccountSettingsddressReturn & {
    range: number;
    coords: TCoordsValue;
    dispatchCoords: Dispatch<TCoordsValue>;
    dispatchRange: Dispatch<number>;
    addressInputRef: MutableRefObject<HTMLInputElement | null>;
  };

export type TAccountSettingsStateReturn = ReturnType<
  typeof useAccountSettingsState
>;

export type TAccountSettingsContext =
  TAccountSettingsStateReturn &
    TAccountSettingsConfig &
    TAccountSettingsddressReturn;

export type TAccountSettingsAddressGeocodeConfig =
  TAccountSettingsConfig;

export type TAccountSettingsStateConfig =
  TAccountSettingsAddressGeocodeConfig;
