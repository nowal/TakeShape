'use client';
import { usePainterJobs } from '@/context/dashboard/painter/jobs';
import { usePainterState } from '@/context/dashboard/painter/state';
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
} from 'react';

type TPainterContext = ReturnType<typeof usePainterState> &
  ReturnType<typeof usePainterJobs>;
export const DASHBOARD = createContext<TPainterContext>(
  {} as TPainterContext
);

export const usePainterDashboard = (): TPainterContext =>
  useContext(DASHBOARD);

export const PainterProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const dashboard = usePainterState();
  const jobs = usePainterJobs();

  return (
    <DASHBOARD.Provider value={{ ...dashboard, ...jobs }}>
      {children}
    </DASHBOARD.Provider>
  );
};
