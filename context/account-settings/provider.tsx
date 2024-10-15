'use client';
import { useAccountSettingsAddress } from '@/context/account-settings/address';
import { useAccountSettingsMap } from '@/context/account-settings/map';
import { useAccountSettingsState } from '@/context/account-settings/state';
import {
  TAccountSettingsAddressGeocodeConfig,
  TAccountSettingsConfig,
  TAccountSettingsContext,
  TAccountSettingsStateConfig,
  TCoordsValue,
} from '@/context/account-settings/types';
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useRef,
  useState,
} from 'react';

export const ACCOUNT_SETTINGS =
  createContext<TAccountSettingsContext>(
    {} as TAccountSettingsContext
  );

export const useAccountSettings =
  (): TAccountSettingsContext =>
    useContext(ACCOUNT_SETTINGS);

export const AccountSettingsProvider: FC<
  PropsWithChildren
> = ({ children }) => {
  const [range, setRange] = useState(10);
  const [coords, setCoords] = useState<TCoordsValue>(null);
  const addressInputRef = useRef<HTMLInputElement | null>(
    null
  );
  const [mapElement, setMapElement] =
    useState<HTMLDivElement | null>(null);

  const accountSettingsAddress =
    useAccountSettingsAddress();

  const config: TAccountSettingsConfig = {
    ...accountSettingsAddress,
    coords,
    dispatchCoords: setCoords,
    addressInputRef,
    mapElement,
    dispatchMapElement: setMapElement,
    range,
    dispatchRange: setRange,
  };
  const accountSettingsMap = useAccountSettingsMap(config);
  const accountSettingsAddressGeocodeConfig: TAccountSettingsAddressGeocodeConfig =
    {
      ...accountSettingsMap,
      ...config,
    };

  // const handleGeocodeAddress = useAutoFillAddressGeocode({
  //   ...accountSettingsAddressGeocodeConfig,
  // });

  // const geocodeAddressContext: TGeocodeAddressContext = {
  //   onGeocodeAddress: handleGeocodeAddress,
  // };

  const accountSettingsStateConfig: TAccountSettingsStateConfig =
    //  &
    //   TGeocodeAddressContext
    {
      ...accountSettingsAddressGeocodeConfig,
      // ...geocodeAddressContext,
    };

  const accountSettings = useAccountSettingsState({
    ...accountSettingsStateConfig,
  });

  return (
    <ACCOUNT_SETTINGS.Provider
      value={{
        ...accountSettings,
        ...config,
        ...accountSettingsMap,
        ...accountSettingsAddress,
        // ...geocodeAddressContext,
      }}
    >
      {children}
    </ACCOUNT_SETTINGS.Provider>
  );
};
