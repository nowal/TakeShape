import type { FC } from 'react';
import { LandingProblemAndDecisionText } from '@/components/landing/problem-and-decision/text';
import { InViewReplacersFadeUp } from '@/components/in-view/replacers/fade-up';
import { DashboardHomeownerPlaceholder } from '@/components/dashboard/homeowner/placeholder';
import { MOCKS_PRICES } from '@/components/dashboard/homeowner/contractor-quotes/mocks';
import { cx } from 'class-variance-authority';

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
        <div
          className={cx(
            'w-full',
            'bg-white-1 rounded-lg object-top overflow-hidden',
            'pointer-events-none'
          )}
        >
          <div
            className={cx(
              'relative',
              'left-1/2 -translate-x-1/2',
              'top-0 -translate-y-1/4 ',
              'md:top-1/4 md:translate-y-0',
              'lg:top-1/4 lg:translate-y-0',
              'scale-25',
              'xs:scale-40',
              'md:scale-80',
              'lg:scale-80',
              'xl:scale-65'
            )}
            style={dimensions}
          >
            <DashboardHomeownerPlaceholder
              prices={MOCKS_PRICES}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
