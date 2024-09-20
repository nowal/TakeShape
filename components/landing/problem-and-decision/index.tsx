import type { FC } from 'react';
import Image from 'next/image';
import takingVideo from '@/public/takingVideo.jpg';
import QuoteButton from '@/components/buttons/quote/quoteButton';
import { NotificationsHighlight } from '@/components/notifications/highlight';

export const LandingProblemAndDecision: FC = () => {
  return (
    <div className="flex flex-row items-center h-full">
      {/* Text Section */}
      <div className="flex flex-col">
        <NotificationsHighlight>
          Problem & Decision
        </NotificationsHighlight>
        <h2 className="">
          Your painting quote is only a couple of clicks
          away
        </h2>
        <div className="h-4" />
        <div className="text-pink">
          Getting painting quotes is a nightmare
        </div>
        <p className="">
          Stop the awkward phone calls and in-home estimates
          with strangers. Get guaranteed painting quotes
          instantly with one video. We&apos;ve done the hard
          work of finding the painters, now just show us
          what you want done.
        </p>
        <div className="h-8" />
        <QuoteButton />
      </div>

      {/* Image Section */}
      <div className="">
        <Image
          src={takingVideo.src}
          alt="takingVideo"
          layout="cover"
          width="100"
          height="100"
        />
      </div>
    </div>
  );
};
