import { AnimationFadeUp } from '@/components/animation/fade-up';
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
          backgroundImage:
            'linear-gradient(180deg, rgba(1, 1, 0, 0.00) 0%, rgba(1, 1, 0, 0.50) 100%)',
        }}
      />
      <div className="relative flex flex-col px-10 text-left pb-16 lg:pb-0">
        <h2 className="typography-landing-hero-title--responsive">
          <AnimationFadeUp delay={0.5}>
            One video for no more salesmen in your home, ever
          </AnimationFadeUp>
        </h2>
        <div className="h-5" />
        <AnimationFadeUp delay={0.75}>
          <p className="text-xl">
            It takes 5 minutes to walk through your house.
            Thats's it to never speak with a salesman ever again.
          </p>
        </AnimationFadeUp>
        <div className="h-7" />
        <AnimationFadeUp delay={1}>
          <div className="flex justify-start">
            <QuoteButton className="py-3 px-5 text-xl">
              Color Me Curious!
            </QuoteButton>
          </div>
        </AnimationFadeUp>
      </div>
    </div>
  );
};
