import { QuoteButton } from '@/components/buttons/quote/quoteButton';
import { cx } from 'class-variance-authority';
import type { FC } from 'react';

export const LandingHeroText: FC = () => {
  return (
    <div
      className={cx(
        'relative w-full h-full text-white lg:w-1/2 md:pt-24',
        'flex flex-col justify-end md:justify-center lg:justify-start'
      )}
    >
      <div
        className="flex absolute inset-0 lg:hidden"
        style={{
          background:
            'linear-gradient(180deg, rgba(1, 1, 0, 0.00) 0%, rgba(1, 1, 0, 0.70) 100%)',
        }}
      />
      <div className="relative flex flex-col px-10 text-left pb-16 lg:pb-0">
        <h2 className="typography-landing-hero-title--responsive">
          Love the walls you&apos;re with
        </h2>
        <div className="h-5" />
        <p className="text-xl">
          Find the right paint color and painter for free
          through one video of your space. This is your
          home, your style, your terms.
        </p>
        <div className="h-7" />
        <div className="flex justify-start">
          <QuoteButton className="py-3 px-5 text-xl">
            Color Me Curious!
          </QuoteButton>
        </div>
      </div>
    </div>
  );
};
