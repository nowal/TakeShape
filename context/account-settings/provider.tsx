'use client';
import { useAccountSettingsAddress } from '@/context/account-settings/address';
import { useAccountSettingsState } from '@/context/account-settings/state';
import {
  TAccountSettingsConfig,
  TAccountSettingsContext,
  TCoordsValue,
} from '@/context/account-settings/types';
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
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

  const accountSettingsAddress =
    useAccountSettingsAddress();

  const handleCoordsUpdate = (nextCoords: TCoordsValue) => {
    accountSettingsAddress.prevCoordsRef.current =
      nextCoords;
    setCoords(nextCoords);
  };

  const config: TAccountSettingsConfig = {
    ...accountSettingsAddress,
    coords,
    onCoordsUpdate: handleCoordsUpdate,
    range,
    dispatchRange: setRange,
  };
  const accountSettings = useAccountSettingsState(config);

  return (
    <ACCOUNT_SETTINGS.Provider
      value={{
        ...accountSettings,
        ...config,
        ...accountSettingsAddress,
      }}
    >
      {children}
    </ACCOUNT_SETTINGS.Provider>
  );
};
