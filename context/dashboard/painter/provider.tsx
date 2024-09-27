'use client';
import { useDashboardPainterState } from '@/context/dashboard/painter/state';
import {
  createContext,
  FC,
  MutableRefObject,
  PropsWithChildren,
  useContext,
} from 'react';

type TDashboardPainterContext = ReturnType<
  typeof useDashboardPainterState
> 
export const DASHBOARD = createContext<TDashboardPainterContext>(
  {} as TDashboardPainterContext
);

export const useDashboardPainter = (): TDashboardPainterContext =>
  useContext(DASHBOARD);

export const DashboardPainterProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const dashboard = useDashboardPainterState();
  return (
    <DASHBOARD.Provider value={{ ...dashboard }}>
      {children}
    </DASHBOARD.Provider>
  );
};
