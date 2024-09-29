'use client';
import { usePreferencesState } from '@/context/preferences/state';
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
} from 'react';

type TPreferencesContext = ReturnType<typeof usePreferencesState>;
export const PREFERENCES = createContext<TPreferencesContext>(
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
