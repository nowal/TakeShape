'use client';
import { useSignIn } from '@/context/auth/sign-in';
import { useSignOut } from '@/context/auth/sign-out';
import { TAuthConfig } from '@/context/auth/types';
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useState,
} from 'react';

type TAuthContext = {
  isUserLoggedIn: boolean;
  signIn: ReturnType<typeof useSignIn>;
  signOut: ReturnType<typeof useSignOut>;
};
export const AUTH = createContext<TAuthContext>(
  {} as TAuthContext
);

export const useAuth = (): TAuthContext => useContext(AUTH);

export const AuthProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const [isUserLoggedIn, setUserLoggedIn] = useState(false);
  const config: TAuthConfig = {
    dispatchUserLoggedIn: setUserLoggedIn,
  };
  const signIn = useSignIn(config);
  const signOut = useSignOut(config);

  return (
    <AUTH.Provider
      value={{
        isUserLoggedIn,
        signIn,
        signOut,
      }}
    >
      {children}
    </AUTH.Provider>
  );
};
