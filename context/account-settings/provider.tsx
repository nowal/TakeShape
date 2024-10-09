'use client';
import { useAccountSettingsAddress } from '@/context/account-settings/address';
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
  const addressInputRef = useRef<HTMLInputElement | null>(
    null
  );
  const mapRef = useRef<HTMLDivElement | null>(null);

  const accountSettingsAddress =
    useAccountSettingsAddress();
  const config: TAccountSettingsConfig = {
    ...accountSettingsAddress,
    addressInputRef,
    mapRef,
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
        ...accountSettingsMap,
        ...accountSettingsAddress,
      }}
    >
      {children}
    </ACCOUNT_SETTINGS.Provider>
  );
};
