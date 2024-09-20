import type { FC } from 'react';
import QuoteButton from '@/components/buttons/quote/quoteButton';
import { NotificationsHighlight } from '@/components/notifications/highlight';

export const LandingProblemAndDecisionLeft: FC = () => {
  return (
    <div className="flex flex-col w-[538px]">
      <NotificationsHighlight classDisplay='inline-flex'>
        Problem & Decision
      </NotificationsHighlight>
      <h2 className="">
        Your painting quote is only a couple of clicks away
      </h2>
      <div className="h-4" />
      <div className="text-pink">
        Getting painting quotes is a nightmare
      </div>
      <p className="">
        Stop the awkward phone calls and in-home estimates
        with strangers. Get guaranteed painting quotes
        instantly with one video. We&apos;ve done the hard
        work of finding the painters, now just show us what
        you want done.
      </p>
      <div className="h-8" />
      <QuoteButton />
    </div>
  );
};
