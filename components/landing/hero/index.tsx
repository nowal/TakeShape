import type { FC } from 'react';
import Image from 'next/image';
import image from '@/public/landing/hero.png';
import { resolveUrlId } from '@/utils/css/format';
import {
  FilterGrayscale,
  FILTER_GRAYSCALE_ID,
} from '@/filters/grayscale';
import { LandingHeroText } from '@/components/landing/hero/text';
import { useMotionValue } from 'framer-motion';
import { LandingHeroHandle } from '@/components/landing/hero/handle';
import { TDimensionsReady } from '@/types/measure';
import { LandingHeroHandleLine } from '@/components/landing/hero/handle/line';
import { useObjectPosition } from '@/components/landing/hero/object-position';

type TProps = TDimensionsReady;
export const LandingHero: FC<TProps> = ({ width }) => {
  const x = useMotionValue(width / 2);
  const objectPosition = useObjectPosition();

  return (
    <>
      <FilterGrayscale x={x} />
      <Image
        style={{
          filter: resolveUrlId(FILTER_GRAYSCALE_ID),
          objectPosition,
        }}
        src={image.src}
        alt="Landing Hero, Happy Pic"
        quality="100"
        fill
        objectFit="cover"
        priority
      />
      <LandingHeroHandleLine x={x} />
      <LandingHeroText />
      <LandingHeroHandle x={x} />
    </>
  );
};
