import type { FC } from 'react';
import QuoteButton from '@/components/buttons/quote/quoteButton';

export const LandingDreamRoomText: FC = () => {
  return (
    <div className="relative flex flex-col items-center w-1/2">
      <h3 className="typography-landing-subtitle text-center sm:max-w-[437px]">
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
