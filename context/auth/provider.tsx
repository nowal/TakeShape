'use client';
import { useAuthMenu } from '@/context/auth/menu';
import { useSignIn } from '@/context/auth/sign-in';
import { usePassiveSignOut } from '@/context/auth/passive-sign-out';
import { useSignUp } from '@/context/auth/sign-up';
import {
  TAuthConfig,
  TAuthSignOutConfig,
} from '@/context/auth/types';
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useState,
} from 'react';
import { useAtom } from 'jotai';
import { isProfilePicAtom } from '@/atom';
import { useSignOut } from '@/context/auth/sign-out';
import { useAccountSettings } from '@/context/account-settings/provider';

type TAuthContext = TAuthConfig & {
  isUserSignedIn: boolean;
  signIn: ReturnType<typeof useSignIn>;
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
  const { profilePictureSrc, dispatchProfilePictureUrl } =
    useAccountSettings();
  const [isAuthLoading, setAuthLoading] = useState(true);
  const [isUserSignedIn, setUserSignedIn] = useState(false);
  const signOutConfig: TAuthSignOutConfig = {
    profilePictureSrc,
    isUserSignedIn,
    isAuthLoading,
    dispatchAuthLoading: setAuthLoading,
    dispatchUserSignedIn: setUserSignedIn,
    dispatchProfilePictureUrl,
  };
  const handleSignOut = useSignOut(signOutConfig);
  const config: TAuthConfig = {
    onSignOut: handleSignOut,
    ...signOutConfig,
  };
  const signIn = useSignIn(config);
  const signUp = useSignUp(config);
  const menu = useAuthMenu(config);

  usePassiveSignOut(config);

  return (
    <AUTH.Provider
      value={{
        signIn,
        signUp,
        menu,
        ...config,
      }}
    >
      {children}
    </AUTH.Provider>
  );
};
