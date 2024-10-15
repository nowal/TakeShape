'use client';
import { createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { TAppConfig } from '@/context/app/types';
import { TProviderFc } from '@/context/type';

export const APP = createContext<TAppConfig>(
  {} as TAppConfig
);

export const useApp = (): TAppConfig => useContext(APP);

export const AppProvider: TProviderFc = ({ children }) => {
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
