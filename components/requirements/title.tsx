import { InViewReplacersFadeUp } from '@/components/in-view/replacers/fade-up';
import type { FC } from 'react';

export const RequirementsFaqTitle: FC = () => {
  return (
    <div className="relative w-full">
      <div className="flex flex-col items-center pb-24 pt-0 w-full lg:py-14">
        <InViewReplacersFadeUp>
          <h3 className="typography-landing-subtitle--responsive max-w-[477px]">
            Painter Requirements
          </h3>
        </InViewReplacersFadeUp>
      </div>
    </div>
  );
};
