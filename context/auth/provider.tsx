'use client';
import { useAuthMenu } from '@/context/auth/menu';
import { useSignIn } from '@/context/auth/sign-in';
import { useSignOut } from '@/context/auth/sign-out';
import { useSignUp } from '@/context/auth/sign-up';
import { TAuthConfig } from '@/context/auth/types';
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useState,
} from 'react';

type TAuthContext = TAuthConfig & {
  isUserSignedIn: boolean;
  signIn: ReturnType<typeof useSignIn>;
  signOut: ReturnType<typeof useSignOut>;
  signUp: ReturnType<typeof useSignUp>;
  menu: ReturnType<typeof useAuthMenu>;
};
export const AUTH = createContext<TAuthContext>(
  {} as TAuthContext
);

export const useAuth = (): TAuthContext => useContext(AUTH);

export const AuthProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const [isUserSignedIn, setUserSignedIn] = useState(false);
  const config: TAuthConfig = {
    dispatchUserSignedIn: setUserSignedIn,
  };
  const signIn = useSignIn(config);
  const signOut = useSignOut(config);
  const signUp = useSignUp(config);
  const menu = useAuthMenu(config);

  return (
    <AUTH.Provider
      value={{
        isUserSignedIn,
        signIn,
        signOut,
        signUp,
        menu,
        ...config,
      }}
    >
      {children}
    </AUTH.Provider>
  );
};
