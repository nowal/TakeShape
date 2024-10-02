import type { FC } from 'react';
import { FilterGrayscale } from '@/filters/grayscale';
import { LandingHeroText } from '@/components/landing/hero/text';
import { useMotionValue } from 'framer-motion';
import { LandingHeroHandle } from '@/components/landing/hero/handle';
import { TDimensionsReady } from '@/types/measure';
import { LandingHeroHandleLine } from '@/components/landing/hero/handle/line';
import { useViewport } from '@/context/viewport';

type TProps = TDimensionsReady;
export const LandingHero: FC<TProps> = ({ width }) => {
  const x = useMotionValue(width / 2);
  const viewport = useViewport();
  const isDesktop = viewport.isDimensions && !viewport.isSm;

  return (
    <>
      {isDesktop && <FilterGrayscale x={x} />}
      {isDesktop && <LandingHeroHandleLine x={x} />}
      <LandingHeroText />
      {isDesktop && <LandingHeroHandle x={x} />}
    </>
  );
};
