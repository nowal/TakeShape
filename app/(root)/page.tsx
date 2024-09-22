'use client';
import { LandingFaq } from '@/components/landing/faq';
import { LandingProblemAndDecision } from '@/components/landing/problem-and-decision';
import { LandingHero } from '@/components/landing/hero';
import { LandingBenefits } from '@/components/landing/benefits';
import { LandingDreamRoom } from '@/components/landing/dream-room';
import { LANDING_HERO_HEIGHT } from '@/components/landing/hero/constants';
import { useViewport } from '@/context/viewport';
import { cx } from 'class-variance-authority';

const Landing = () => {
  const viewport = useViewport();
  return (
    <>
      <section
        className="relative"
        style={{ height: LANDING_HERO_HEIGHT }}
      >
        <div className="h-20" />
        {viewport.isDimensions && (
          <LandingHero {...viewport} />
        )}
      </section>
      <section className="relative h-[676px]">
        <LandingBenefits />
      </section>
      <section className="relative h-[645]">
        {/* 572px + 73px */}
        <LandingProblemAndDecision />
      </section>
      <section className={cx('relative',
        //  'h-[636px]'
         )}>
        {/* 560px + 76px */}
        <LandingFaq />
      </section>
      <section className="relative h-[717px]">
        <LandingDreamRoom />
      </section>
    </>
  );
};
export default Landing;
