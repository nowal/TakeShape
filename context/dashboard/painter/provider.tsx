'use client';
import { usePainterState } from '@/context/dashboard/painter/state';
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
} from 'react';

type TPainterContext = ReturnType<typeof usePainterState>;
export const DASHBOARD = createContext<TPainterContext>(
  {} as TPainterContext
);

export const usePainter = (): TPainterContext =>
  useContext(DASHBOARD);

export const PainterProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const dashboard = usePainterState();
  return (
    <DASHBOARD.Provider value={{ ...dashboard }}>
      {children}
    </DASHBOARD.Provider>
  );
};
