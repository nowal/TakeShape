'use client';
import { usePreferencesState } from '@/context/preferences/state';
import { usePreferencesStateAddress } from '@/context/preferences/state/address';
import { usePreferencesStateColor } from '@/context/preferences/state/color';
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
} from 'react';

type TPreferencesContext = ReturnType<
  typeof usePreferencesState
> &
  ReturnType<typeof usePreferencesStateColor> &
  ReturnType<typeof usePreferencesStateAddress>;
export const PREFERENCES =
  createContext<TPreferencesContext>(
    {} as TPreferencesContext
  );

export const usePreferences = (): TPreferencesContext =>
  useContext(PREFERENCES);

export const PreferencesProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const preferences = usePreferencesState();
  return (
    <PREFERENCES.Provider value={preferences}>
      {children}
    </PREFERENCES.Provider>
  );
};
