import type { FC } from 'react';
import QuoteButton from '@/components/buttons/quote/quoteButton';

export const LandingProblemAndDecisionLeft: FC = () => {
  return (
    <div className="flex flex-col items-start w-[538px]">
      <span className='py-2.5 px-4 bg-white-pink-4 rounded-xl'>
        Problem & Decision
      </span>
      <h2 className="typography-landing-subtitle">
        Your painting quote is only a couple of clicks away
      </h2>
      <div className="h-4" />
      <div className="text-pink">
        Getting painting quotes is a nightmare
      </div>
      <p className="">
        Stop the awkward phone calls and in-home estimates
        with strangers. Get guaranteed painting quotes
        instantly with one video. We&apos;ve done the hard
        work of finding the painters, now just show us what
        you want done.
      </p>
      <div className="h-8" />
      <QuoteButton />
    </div>
  );
};
