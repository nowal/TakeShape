import type { FC } from 'react';
import { cx } from 'class-variance-authority';
import { QuoteInstructions } from '@/components/quote/instructions';
import { QuoteInstructionsBackground } from '@/components/quote/instructions/background';
import { ComponentsQuoteInput } from '@/components/quote/input';

export const ComponentsQuote: FC = () => {
  return (
    <div className="flex flex-col items-center gap-6 lg:gap-4 xl:gap-4">
      <div className="flex flex-col items-center px-4 lg:px-0 gap-1 text-center">
        <h2 className="typography-page-title">
          View Instructions, Take Video, Receive Quotes
        </h2>
        {/*<h3 className="typography-page-subtitle">
          We've made quoting simple, please view the instructions below
        </h3>*/}
      </div>
      <div className="flex flex-col items-center justify-center gap-[31px] mx-auto lg:flex-col">
        <div
          className={cx(
            'relative',
            'xs:w-[21rem]',
            'w-full',
            'bg-white-pink-1',
            'rounded-md'
          )}
        >
          <QuoteInstructionsBackground />
          <QuoteInstructions />
        </div>
        <ComponentsQuoteInput /> {/* Moved ComponentsQuoteInput below */}
        <div
          className={cx(
            'hidden xl:flex',
            'w-0 h-0 ',
            'xs:w-[21rem]'
          )}
        />
      </div>
    </div>
  );
};
