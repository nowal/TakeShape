'use client';
import { useAuthMenu } from '@/context/auth/menu';
import { useSignIn } from '@/context/auth/sign-in';
import { usePassiveSignOut } from '@/context/auth/passive-sign-out';
import { useSignUp } from '@/context/auth/sign-up';
import { TAuthConfig } from '@/context/auth/types';
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const [isUserSignedIn, setUserSignedIn] = useState(false);
  const handleNavigateScrollTopClick = async (
    path: string
  ) => {
    router.push(path, { scroll: true });
  };
  const config: TAuthConfig = {
    isUserSignedIn,
    dispatchUserSignedIn: setUserSignedIn,
    onNavigateScrollTopClick: handleNavigateScrollTopClick,
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
