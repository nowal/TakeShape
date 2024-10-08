import type { FC } from 'react';
import { cx } from 'class-variance-authority';
import { QuoteInstructions } from '@/components/quote/instructions';
import { QuoteInstructionsBackground } from '@/components/quote/instructions/background';
import { QuoteInput } from '@/components/quote/input';

export const ComponentsQuote: FC = () => {
  return (
    <div className="flex flex-col items-center gap-6 lg:gap-4 xl:gap-0">
      <div className="flex flex-col items-center gap-1">
        <h2 className="typography-page-title">
          Get an Instant Painting Quote Today
        </h2>
        <h3 className="typography-page-subtitle">
          Upload a Video, Receive a Quote Within Minutes
        </h3>
      </div>
      <div className="flex flex-col items-center justify-center gap-[31px] mx-auto lg:flex-row">
        <div
          className={cx(
            'hidden xl:flex',
            'w-0 h-0 ',
            'xs:w-[21rem]'
          )}
        />
        <QuoteInput />
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
      </div>
    </div>
  );
};
