'use client';
import {
  LANDING_HERO_HEIGHT_LG,
  LANDING_HERO_HEIGHT,
} from '@/components/landing/hero/constants';
import {
  HEADER_HEIGHT,
  HEADER_HEIGHT_SM,
  HEADER_HEIGHT_PADDING,
} from '@/components/shell/header/constants';
import {
  TViewport,
  INIT_VIEWPORT,
  useViewportMeasure,
} from '@/context/viewport/use-measure';
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
} from 'react';

type TViewportContext = TViewport & {
  landingHeroHeight: number;
  headerHeight: number;
  headerHeightWithPadding: number;
};
const INIT: TViewportContext = {
  ...INIT_VIEWPORT,
  landingHeroHeight: LANDING_HERO_HEIGHT,
  headerHeight: HEADER_HEIGHT,
  headerHeightWithPadding:
    HEADER_HEIGHT + HEADER_HEIGHT_PADDING,
};

export const VIEWPORT =
  createContext<TViewportContext>(INIT);

export const useViewport = (): TViewportContext =>
  useContext<TViewportContext>(VIEWPORT);

export const ViewportProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const viewport = useViewportMeasure();
  const headerHeight =
    viewport.isDimensions && viewport.isSm
      ? HEADER_HEIGHT_SM
      : HEADER_HEIGHT;
  return (
    <VIEWPORT.Provider
      value={{
        ...viewport,
        landingHeroHeight:
          viewport.isDimensions && viewport.isMd
            ? LANDING_HERO_HEIGHT_LG
            : LANDING_HERO_HEIGHT,
        headerHeight,
        headerHeightWithPadding:
          headerHeight + HEADER_HEIGHT_PADDING,
      }}
    >
      {children}
    </VIEWPORT.Provider>
  );
};
