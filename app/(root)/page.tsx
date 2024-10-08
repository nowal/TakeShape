'use client';
import { LandingFaq } from '@/components/landing/faq';
import { LandingProblemAndDecision } from '@/components/landing/problem-and-decision';
import { LandingHero } from '@/components/landing/hero';
import { LandingBenefits } from '@/components/landing/benefits';
import { LandingDreamRoom } from '@/components/landing/dream-room';
import { cx } from 'class-variance-authority';
import { QuoteButton } from '@/components/buttons/quote/quoteButton';
import Image from 'next/image';
import image from '@/public/landing/hero.png';
import { resolveUrlId } from '@/utils/css/format';
import { FILTER_GRAYSCALE_ID } from '@/filters/grayscale';
import { LandingHeroText } from '@/components/landing/hero/text';
import { useObjectPosition } from '@/components/landing/hero/object-position';
import { useViewport } from '@/context/viewport';
import { InViewReplacersFadeUp } from '@/components/in-view/replacers/fade-up';
import { AnimationFadeUp } from '@/components/animation/fade-up';
import { AnimationFade } from '@/components/animation/fade';

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
        <AnimationFade classValue="absolute inset-0">
          <Image
            style={{
              filter: resolveUrlId(FILTER_GRAYSCALE_ID),
              objectPosition,
              objectFit: 'cover',
            }}
            src={image.src}
            alt="Landing Hero, Happy Pic"
            quality="100"
            fill
            priority
            loading="eager"
          />
        </AnimationFade>

        {viewport.isDimensions && !viewport.isResizing ? (
          <LandingHero {...viewport} />
        ) : (
          <LandingHeroText />
        )}
      </section>
      <section
        className={cx(
          'relative',
          'xl:h-[676px]',
          'flex flex-col items-center px-0 sm:px-20 lg:px-44 xl:px-0'
        )}
      >
        <LandingBenefits />
      </section>
      <div className="flex justify-center py-12 xl:py-0 xl:hidden">
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
