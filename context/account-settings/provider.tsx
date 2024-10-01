'use client';
import { useAccountSettingsMap } from '@/context/account-settings/map';
import { useAccountSettingsState } from '@/context/account-settings/state';
import {
  TAccountSettingsConfig,
  TAccountSettingsContext,
  TAccountSettingsStateConfig,
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
  const addressInputRef = useRef<HTMLInputElement|null>(null);
  const mapRef = useRef<HTMLDivElement|null>(null);
  const [address, setAddress] = useState('');

  const config: TAccountSettingsConfig = {
    address,
    dispatchAddress: setAddress,
    addressInputRef,
    mapRef
  };

  const accountSettingsMap = useAccountSettingsMap(config);
  const accountSettingsConfig: TAccountSettingsStateConfig =
    {
      ...accountSettingsMap,
      ...config,
    };
  const accountSettings = useAccountSettingsState(
    accountSettingsConfig
  );

  return (
    <ACCOUNT_SETTINGS.Provider
      value={{
        ...accountSettings,
        ...config,
        ...accountSettingsMap
      }}
    >
      {children}
    </ACCOUNT_SETTINGS.Provider>
  );
};
