import type { FC } from 'react';
import QuoteButton from '@/components/buttons/quote/quoteButton';
import { cx } from 'class-variance-authority';

export const LandingProblemAndDecisionText: FC = () => {
  return (
    <div
      className={cx(
        'flex flex-col items-center w-full pt-9',
        'rounded-t-4xl bg-white-8',
        'px-7',
        'text-center',
        'xl:items-start xl:text-left',
        'sm:px-0 sm:pt-0 sm:pr-4',
        'sm:rounded-t-0 sm:bg-transparent',
        'sm:w-[538px] '
      )}
    >
      <span
        className={cx(
          'leading-none',
          'py-2.5 px-4 rounded-xl',
          'text-pink font-bold',
          'bg-white sm:bg-white-pink-4'
        )}
      >
        Problem & Decision
      </span>
      <div className="h-3" />
      <h2
        className={cx(
          'typography-landing-subtitle--responsive',
          'px-0 xs:px-7 md:px-0',
        )}
      >
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
      <div className="hidden xl:flex">
        <QuoteButton />
      </div>
    </div>
  );
};
