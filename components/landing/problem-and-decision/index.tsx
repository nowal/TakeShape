import type { FC } from 'react';
import Image from 'next/image';
import takingVideo from '@/public/landing/problem-and-decision.png';
import { LandingProblemAndDecisionText } from '@/components/landing/problem-and-decision/text';

export const LandingProblemAndDecision: FC = () => {
  const dimensions = {
    width: 707,
    height: 572,
  };
  return (
    <div className="spacing-landing pb-20 h-full">
      <div className="flex flex-col items-center justify-between h-full w-full xl:flex-row">
        <LandingProblemAndDecisionText />
        <Image
          src={takingVideo.src}
          alt="Taking Video"
          {...dimensions}
        />
      </div>
    </div>
  );
};
