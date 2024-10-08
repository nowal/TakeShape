import type { FC } from 'react';
import { cx } from 'class-variance-authority';
import { ComponentsCongratsPanel } from '@/components/congrats/panel';
import { LandingBenefitsBackground } from '@/components/landing/benefits/background';
import { PainterCard } from '@/components/painter/card';
import { MOCKS_PAINTER_DATA } from '@/components/dashboard/homeowner/contractor-quotes/mocks';
import { PainterCardBackground } from '@/components/painter/card/background';

export const LandingBenefitsCongrats: FC = () => {
  return (
    <LandingBenefitsBackground>
      <div
        className={cx(
          'relative',
          'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
          'mt-0 xl:mt-8',
          'scale-60 xs:scale-100 sm:scale-120 xl:scale-75',
          'flex items-center justify-center'
        )}
      >
        <ComponentsCongratsPanel short="Contractor will reach out within two days to schedule your job.">
          <PainterCardBackground>
            <PainterCard {...MOCKS_PAINTER_DATA} />
          </PainterCardBackground>
        </ComponentsCongratsPanel>
      </div>
    </LandingBenefitsBackground>
  );
};
