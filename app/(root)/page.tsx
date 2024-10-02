'use client';
import { LandingFaq } from '@/components/landing/faq';
import { LandingProblemAndDecision } from '@/components/landing/problem-and-decision';
import { LandingHero } from '@/components/landing/hero';
import { LandingBenefits } from '@/components/landing/benefits';
import { LandingDreamRoom } from '@/components/landing/dream-room';
import { cx } from 'class-variance-authority';
import QuoteButton from '@/components/buttons/quote/quoteButton';
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
import { useViewport } from '@/context/viewport';

const Landing = () => {
  const viewport = useViewport();
  const objectPosition = useObjectPosition();

  return (
    <>
      <section
        className="relative"
        style={{
          height: viewport.landingHeroHeight,
        }}
      >
        <div className="h-0 lg:h-20" />
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
        {viewport.isDimensions && !viewport.isResizing ? (
          <LandingHero {...viewport} />
        ) : (
          <LandingHeroText />
        )}
      </section>
      <section className={cx('relative', 'lg:h-[676px]')}>
        <LandingBenefits />
      </section>
      <div className="flex justify-center py-12 lg:py-0 lg:hidden">
        <QuoteButton />
      </div>
      <section className={cx('relative lg:h-[645]')}>
        {/* 572px + 73px */}
        <LandingProblemAndDecision />
      </section>
      <section
        className={cx(
          'relative',
          'overflow-hidden'
          //  'h-[636px]'
        )}
      >
        {/* 560px + 76px */}
        <LandingFaq />
      </section>
      <section className="relative h-[748px] lg:h-[717px]">
        {/* 221px + 527px */}
        <LandingDreamRoom />
      </section>
    </>
  );
};
export default Landing;
