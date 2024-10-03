import type { FC } from 'react';
import {QuoteButton} from '@/components/buttons/quote/quoteButton';
import { cx } from 'class-variance-authority';

export const LandingDreamRoomText: FC = () => {
  return (
    <div
      className={cx(
        'relative w-full lg:w-1/2',
        'flex flex-col items-center'
      )}
    >
      <h3 className="typography-landing-subtitle--responsive text-center max-w-[280px] lg:max-w-[437px]">
        Your dream room is only a few clicks away
      </h3>
      <div className="h-2" />
      <h4 className="typography-landing-text">
        We will contact you as soon as possible!
      </h4>
      <div className="h-6" />
      <QuoteButton />
    </div>
  );
};
