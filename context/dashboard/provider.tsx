'use client';
import { useDashboardState } from '@/context/dashboard/state';
import {
  createContext,
  FC,
  MutableRefObject,
  PropsWithChildren,
  useContext,
  useRef,
} from 'react';

type TDashboardContext = ReturnType<
  typeof useDashboardState
> & {
  videoRef: MutableRefObject<HTMLVideoElement | null>;
};
export const DASHBOARD = createContext<TDashboardContext>(
  {} as TDashboardContext
);

export const useDashboard = (): TDashboardContext =>
  useContext(DASHBOARD);

export const DashboardProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const dashboard = useDashboardState();
  return (
    <DASHBOARD.Provider value={{ videoRef, ...dashboard }}>
      {children}
    </DASHBOARD.Provider>
  );
};
