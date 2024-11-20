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
        pretitle="Don't Wait!"
        title="Getting painting quotes used to be a nightmare"
        subtitle="Your painting quote is only clicks away"
        text={
          <p>
            We provide proud homeowners quick painting quotes 
            so they can avoid in-home estimates 
            and love the home they&apos;re in!

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
