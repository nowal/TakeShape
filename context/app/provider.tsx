'use client';
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
} from 'react';
import { useRouter } from 'next/navigation';
import { TAppConfig } from '@/context/app/types';

export const APP = createContext<TAppConfig>(
  {} as TAppConfig
);

export const useApp = (): TAppConfig => useContext(APP);

export const AppProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const router = useRouter();
  const handleNavigateScrollTopClick = async (
    path: string
  ) => {
    router.push(path, { scroll: true });
  };
  return (
    <APP.Provider
      value={{
        onNavigateScrollTopClick:
          handleNavigateScrollTopClick,
      }}
    >
      {children}
    </APP.Provider>
  );
};
