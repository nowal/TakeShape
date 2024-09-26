import type { FC } from 'react';
import { MOCKS_PRICES } from '@/components/dashboard/client/quotes/mocks';
import { NotificationsHighlight } from '@/components/notifications/highlight';
import { LandingBenefitsReceieveQuotesItem } from '@/components/landing/benefits/receive-quotes/item';
import { PainterCardInfo } from '@/components/painter-card/info';
import { cx } from 'class-variance-authority';

export const LandingBenefitsReceieveQuotes: FC = () => {
  const prices = MOCKS_PRICES;
  const isEmpty = !prices || prices.length === 0;

  if (isEmpty) {
    return (
      <NotificationsHighlight>
        No quotes
      </NotificationsHighlight>
    );
  }

  return (
    <div
      className={cx(
        'absolute inset-0 overflow-hidden border border-white-8',
        'rounded-2xl lg:rounded-4xl',
        'pointer-events-none'
      )}
    >
      <ul className="absolute -left-8 bottom-3/4 -translate-y-4 w-full scale-75">
        {prices.map((price, index) => {
          const offset = index * 2.8;
          const transform =
            `translate(${offset}rem, ${offset}rem)` as const;
          return (
            <LandingBenefitsReceieveQuotesItem
              key={`${price.painterId}-${index}`}
              classValue="absolute w-full"
              style={{
                transform,
              }}
              price={price}
              index={index}
              PainterCardInfoFc={PainterCardInfo}
            />
          );
        })}
      </ul>
    </div>
  );
};
