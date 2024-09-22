import QuoteButton from '@/components/buttons/quote/quoteButton';
import type { FC } from 'react';

export const LandingHeroText: FC = () => {
  return (
    <div className="relative flex flex-col w-full justify-center text-white md:w-1/2 md:mt-24">
      <div className="flex flex-col ml-10">
        <h2
          style={{
            fontSize: '5rem',
            fontWeight: 800,
            lineHeight: '5.0625rem' /* 101.25% */,
            letterSpacing: '-0.09375rem',
          }}
        >
          Love the walls you&apos;re with
        </h2>
        <div className="h-5" />
        <p className="text-xl mb-8 text-center md:text-left">
          Find the right paint color and painter for free
          through one video of your space. This is your
          home, your style, your terms.
        </p>
        <div className="h-7" />

        <div className="flex justify-center md:justify-start">
          <QuoteButton className="py-3 px-5 text-xl">
            Color Me Curious!
          </QuoteButton>
        </div>
      </div>
    </div>
  );
};
