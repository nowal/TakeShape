'use client';

import { useLanding } from '@/context/landing/provider';
import { LandingQuote } from '@/components/landing/quote';
import { LandingFaq } from '../../components/landing/faq';
import { LandingHowItWorks } from '@/components/landing/how-it-works';
import { LandingProblemAndDecision } from '@/components/landing/problem-and-decision';
import { LandingHero } from '@/components/landing/hero';

const Landing = () => {
  const landing = useLanding();

  return (
    <div className="">
      <section className="h-[700px] bg-red">
        <LandingHero />
      </section>
      <section className="h-[676px] bg-fuchsia-600">
        <LandingProblemAndDecision />
      </section>
      <section className="h-[645] bg-indigo-400">
        {/* 572px + 73px */}
        <LandingHowItWorks />
      </section>
      <section className="h-[636px] bg-sky-600">
        {/* 560px + 76px */}
        <LandingQuote />
      </section>
      <section className="h-[717px] bg-red">
        <LandingFaq />
      </section>
    </div>
  );
};
export default Landing;
