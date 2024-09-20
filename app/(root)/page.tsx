'use client';;
import { LandingFaq } from '@/components/landing/faq';
import { LandingProblemAndDecision } from '@/components/landing/problem-and-decision';
import { LandingHero } from '@/components/landing/hero';
import { LandingBenefits } from '@/components/landing/benefits';
import { LandingDreamRoom } from '@/components/landing/dream-room';

const Landing = () => {

  return (
    <>
      <section className="relative h-[700px]">
        <div className="h-20" />
        <LandingHero />
      </section>
      <section className="relative h-[676px] bg-fuchsia-600">
        <LandingBenefits />
      </section>
      <section className="relative h-[645] bg-indigo-400">
        {/* 572px + 73px */}
        <LandingProblemAndDecision />
      </section>
      <section className="relative h-[636px] bg-sky-600">
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
