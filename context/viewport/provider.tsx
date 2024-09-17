"use client"
import { TViewport, INIT_VIEWPORT, useViewportMeasure } from '@/context/viewport/use-measure';
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
} from 'react';


const INIT: TViewport = {
  ...INIT_VIEWPORT,
};

export const VIEWPORT = createContext<TViewport>(INIT);

export const useViewport = (): TViewport =>
  useContext<TViewport>(VIEWPORT);

export const ViewportProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const viewport = useViewportMeasure();

  return (
    <VIEWPORT.Provider value={viewport}>
      {children}
    </VIEWPORT.Provider>
  );
};
