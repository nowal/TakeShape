import type { FC } from 'react';
import Image from 'next/image';
import takingVideo from '@/public/landing/problem-and-decision.png';
import { LandingProblemAndDecisionText } from '@/components/landing/problem-and-decision/text';
import { InViewReplacersFadeUp } from '@/components/in-view/replacers/fade-up';

export const LandingProblemAndDecision: FC = () => {
  const dimensions = {
    width: 707,
    height: 572,
  };
  return (
    <div className="spacing-landing pb-20 h-full">
      <div className="relative flex flex-col items-center justify-between h-full w-full xl:flex-row">
        <InViewReplacersFadeUp>
          <LandingProblemAndDecisionText />
        </InViewReplacersFadeUp>
        <Image
          src={takingVideo.src}
          alt="Taking Video"
          loading="lazy"
          {...dimensions}
        />
      </div>
    </div>
  );
};
