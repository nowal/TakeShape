import type { FC } from 'react';
import { MOCKS_PRICES } from '@/components/dashboard/homeowner/contractor-quotes/mocks';
import { LandingBenefitsReceieveQuotesItem } from '@/components/landing/benefits/receive-quotes/item';
import { PainterCard } from '@/components/painter/card';
import { LandingBenefitsBackground } from '@/components/landing/benefits/background';
import { cx } from 'class-variance-authority';

export const LandingBenefitsReceieveQuotes: FC = () => {
  const prices = MOCKS_PRICES;

  return (
    <LandingBenefitsBackground>
      <ul
        className={cx(
          '-translate-y-15 absolute -left-8 bottom-3/4 lg:-translate-y-11 w-full scale-75',
          'scale-60 sm:scale-80 xl:scale-75'
        )}
      >
        {prices.map((price, index) => {
          const offsetX = index * 2.8;
          const offsetY = offsetX * 1.8;
          const transform =
            `translate(${offsetX}rem, ${offsetY}rem)` as const;

          return (
            <LandingBenefitsReceieveQuotesItem
              key={`${price.painterId}-${index}`}
              classValue="absolute w-full"
              style={{
                transform,
              }}
              price={price}
              index={index}
              PainterCardFc={PainterCard}
            />
          );
        })}
      </ul>
    </LandingBenefitsBackground>
  );
};
