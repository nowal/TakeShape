import type { FC } from 'react';
import Image from 'next/image';
import happyPic from '@/public/landing/hero.png';
import { resolveUrlId } from '@/utils/css/format';
import {
  FilterGrayscale,
  FILTER_GRAYSCALE_ID,
} from '@/filters/grayscale';
import { LandingHeroText } from '@/components/landing/hero/text';
import { useMotionValue } from 'framer-motion';
import { LandingHeroHandle } from '@/components/landing/hero/handle';
import { TDimensionsReady } from '@/types/measure';

type TProps = TDimensionsReady;
export const LandingHero: FC<TProps> = ({ width }) => {
  const x = useMotionValue(width / 2);

  return (
    <>
      <>
        <FilterGrayscale x={x} />
        <Image
          style={{
            filter: resolveUrlId(FILTER_GRAYSCALE_ID),
          }}
          src={happyPic.src}
          alt="Happy Pic"
          quality="100"
          layout="fill"
          objectFit="cover"
          priority
        />
        <LandingHeroText />
      </>
      <LandingHeroHandle x={x} />
    </>
  );
};
