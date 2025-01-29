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
            Love your walls with video painting quotes
          </AnimationFadeUp>
        </h2>
        <div className="h-5" />
        <AnimationFadeUp delay={0.75}>
          <p className="text-xl">
            Take one video of your space and get quotes from
            local painters. Avoid in-home estimates and bring your vision to life.
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
