import { LandingBenefitsItem } from '@/components/landing/benefits/item';
import { cx } from 'class-variance-authority';
import type { FC } from 'react';
import { LandingBenefitsReceieveQuotes } from '@/components/landing/benefits/receive-quotes';
import { LandingBenefitsCongrats } from '@/components/landing/benefits/congrats';
import { LandingBenefitsUpload } from '@/components/landing/benefits/upload';

export const LandingBenefits: FC = () => {
  return (
    <div className="flex flex-col items-center w-full h-full overflow-hidden">
      <div className="h-20" />
      <h3 className="typography-landing-subtitle--responsive">
        Benefits
      </h3>
      <div className="h-9" />
      <ul
        className={cx(
          'flex flex-col items-stretch w-full justify-stretch xl:flex-row',
          'gap-12 px-9 xl:gap-5'
        )}
      >
        {(
          [
            [
              'No more in-home estimates',
              'Get painting quotes without having more painters in your home.',
              LandingBenefitsUpload,
            ],
            [
              'The best painter at the best price',
              'Compare competitve quotes from local painters with verified experience.',
              LandingBenefitsReceieveQuotes,
            ],
            [
              'Fast and Free',
              'Receive and approve quotes in a couple of clicks. Only pay a deposit when you are ready to paint.',
              LandingBenefitsCongrats,
            ],
          ] as const
        ).map(([title, description, PreviewFc]) => {
          return (
            <li className="flex-1" key={title}>
              <LandingBenefitsItem
                key={title}
                title={title}
                description={description}
                PreviewFc={PreviewFc}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
};
