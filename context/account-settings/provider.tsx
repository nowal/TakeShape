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
  const accountSettingsAddress =
    useAccountSettingsAddress();

  const config: TAccountSettingsConfig = {
    ...accountSettingsAddress,
    coords,
    dispatchCoords: setCoords,
    addressInputRef,
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
