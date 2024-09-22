import type { FC } from 'react';
import QuoteButton from '@/components/buttons/quote/quoteButton';
import { cx } from 'class-variance-authority';

export const LandingProblemAndDecisionLeft: FC = () => {
  return (
    <div className="flex flex-col items-start w-[538px]">
      <span
        className={cx(
          'leading-none',
          'py-2.5 px-4 bg-white-pink-4 rounded-xl',
          'text-pink font-bold'
        )}
      >
        Problem & Decision
      </span>
      <div className='h-3'/>
      <h2 className="typography-landing-subtitle">
        Your painting quote is only a couple of clicks away
      </h2>
      <div className="h-4" />
      <div className="text-pink font-bold text-xl	">
        Getting painting quotes is a nightmare
      </div>
      <div className="h-1" />
      <p className="text-gray-7">
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
