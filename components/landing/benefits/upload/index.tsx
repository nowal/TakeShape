import type { FC } from 'react';
import { cx } from 'class-variance-authority';
import { LandingBenefitsBackground } from '@/components/landing/benefits/background';
import { ComponentsQuoteInput } from '@/components/quote/input';

export const LandingBenefitsUpload: FC = () => {
  return (
    <LandingBenefitsBackground>
      <div
        className={cx(
          'relative',
          'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
          'scale-75 sm:scale-90 md:scale-110 xl:scale-75',
          'flex items-center justify-center'
        )}
      >
        <ComponentsQuoteInput fixedTitle="Full House" />
      </div>
    </LandingBenefitsBackground>
  );
};
