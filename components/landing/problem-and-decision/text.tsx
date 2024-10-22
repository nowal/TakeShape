import type { FC } from 'react';
import { QuoteButton } from '@/components/buttons/quote/quoteButton';
import { TextLayout } from '@/components/text/layout';
import { cx } from 'class-variance-authority';

export const LandingProblemAndDecisionText: FC = () => {
  return (
    <div
      className={cx(
        'flex flex-col items-center w-full',
        'rounded-t-4xl bg-white-8',
        'text-center',
        'pt-9 sm:pt-0',
        'px-7 sm:px-0 sm:pr-4',
        'xl:items-start xl:text-left',
        'sm:rounded-t-0 sm:bg-transparent',
        'sm:w-[538px] '
      )}
    >
      <TextLayout
        pretitle="Still Waiting?"
        title="Getting painting quotes used to be a nightmare"
        subtitle="Your painting quote is only clicks away"
        text={
          <p>
            &quot;Stop the awkward phone calls and in-home
            estimates with strangers. Get guaranteed
            painting quotes instantly with one video.
            We&apos;ve done the hard work of finding the
            painters, now just show us what you want
            done.&quot;
          </p>
        }
      />
      <div className="h-8" />
      <div className="hidden xl:flex">
        <QuoteButton />
      </div>
    </div>
  );
};
