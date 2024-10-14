'use client';
import { useLandingState } from '@/_prev-root/landing/state';
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
} from 'react';

type TLandingContext = ReturnType<typeof useLandingState>;
export const LANDING = createContext<TLandingContext>(
  {} as TLandingContext
);

export const useLanding = (): TLandingContext =>
  useContext(LANDING);

export const LandingProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const landing = useLandingState();
  return (
    <LANDING.Provider value={landing}>
      {children}
    </LANDING.Provider>
  );
};
