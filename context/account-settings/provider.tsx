'use client';
import { useAccountSettingsState } from '@/context/account-settings/state';
import {
  createContext,
  FC,
  MutableRefObject,
  PropsWithChildren,
  useContext,
  useRef,
} from 'react';

type TAccountSettingsContext = ReturnType<
  typeof useAccountSettingsState
> & {
  addressInputRef: MutableRefObject<HTMLInputElement | null>;
};
export const ACCOUNT_SETTINGS = createContext<TAccountSettingsContext>(
  {} as TAccountSettingsContext
);

export const useAccountSettings = (): TAccountSettingsContext =>
  useContext(ACCOUNT_SETTINGS);

export const AccountSettingsProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const addressInputRef = useRef<HTMLInputElement>(null);
  const accountSettings = useAccountSettingsState();
  return (
    <ACCOUNT_SETTINGS.Provider value={{ addressInputRef, ...accountSettings }}>
      {children}
    </ACCOUNT_SETTINGS.Provider>
  );
};
