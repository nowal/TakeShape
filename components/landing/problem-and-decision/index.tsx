import type { FC } from 'react';
import Image from 'next/image';
import takingVideo from '@/public/landing/problem-and-decision.png';
import { LandingProblemAndDecisionLeft } from '@/components/landing/problem-and-decision/left';

export const LandingProblemAndDecision: FC = () => {
  const dimensions = {
    width: 707,
    height: 572,
  };
  return (
    <div className="px-20 pb-20 h-full">
      <div className="flex flex-row items-center justify-between h-full w-full">
        <LandingProblemAndDecisionLeft />
        <Image
          src={takingVideo.src}
          alt="Taking Video"
          {...dimensions}
        />
      </div>
    </div>
  );
};
