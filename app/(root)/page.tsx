'use client';
import { LandingFaq } from '@/components/landing/faq';
import { LandingProblemAndDecision } from '@/components/landing/problem-and-decision';
import { LandingHero } from '@/components/landing/hero';
import { LandingBenefits } from '@/components/landing/benefits';
import { LandingDreamRoom } from '@/components/landing/dream-room';
import { useViewport } from '@/context/viewport';
import { cx } from 'class-variance-authority';
import QuoteButton from '@/components/buttons/quote/quoteButton';

const Landing = () => {
  const viewport = useViewport();
  return (
    <>
      <section
        className="relative"
        style={{
          height: viewport.landingHeroHeight,
        }}
      >
        <div className="h-0 lg:h-20" />
        {viewport.isDimensions && (
          <LandingHero {...viewport} />
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
