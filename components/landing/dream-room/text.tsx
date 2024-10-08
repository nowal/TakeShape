import type { FC } from 'react';
import { QuoteButton } from '@/components/buttons/quote/quoteButton';
import { cx } from 'class-variance-authority';
import { InViewReplacersFadeUp } from '@/components/in-view/replacers/fade-up';

export const LandingDreamRoomText: FC = () => {
  return (
    <div
      className={cx(
        'relative w-full lg:w-1/2',
        'flex flex-col items-center'
      )}
    >
      <h3 className="typography-landing-subtitle--responsive text-center max-w-[280px] lg:max-w-[437px]">
        <InViewReplacersFadeUp>
          Your dream room is only a few clicks away
        </InViewReplacersFadeUp>
      </h3>
      <div className="h-2" />
      <h4 className="typography-landing-text">
        <InViewReplacersFadeUp>
          We will contact you as soon as possible!
        </InViewReplacersFadeUp>
      </h4>
      <div className="h-6" />
      <QuoteButton />
    </div>
  );
};
