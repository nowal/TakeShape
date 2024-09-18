import type { FC } from 'react';
import { DashboardPricesItem } from '@/components/dashboard/prices/item';
import {
  TAcceptQuoteHandler,
  TAgentInfo,
  TPrice,
} from '@/types/types';
import { NotificationsHighlight } from '@/components/notifications/highlight';
import { useDashboard } from '@/context/dashboard/provider';
import { IconsAcceptQuote } from '@/components/icons/accept-quote';
import { cx } from 'class-variance-authority';

export const DashboardClientQuotesList: FC = () => {
  const dashboard = useDashboard();
  const {
    userData,
    onAcceptQuote,
    preferredPainterUserIds,
    agentInfo,
  } = dashboard;
  const prices = userData?.prices ?? [];
  console.log('Rendering quotes with prices:', prices);
  console.log('Agent info:', agentInfo);

  const isGathering = !prices || prices.length === 0;

  return (
    <div className="flex flex-col items-stretch gap-4">
      <h3 className="typography-form-title text-left">
        Contractor Quotes
      </h3>
      {isGathering ? (
        <NotificationsHighlight>
          <>Gathering Quotes...</>
        </NotificationsHighlight>
      ) : (
        prices.map((price, index) => {
          const isPreferredPainter =
            preferredPainterUserIds.includes(
              price.painterId
            );
          console.log(
            `Price ${index}: Painter ID ${price.painterId}, isPreferredPainter: ${isPreferredPainter}`
          );
          if (isPreferredPainter) {
            console.log(
              'Rendering agent info for painter:',
              price.painterId
            );
          }
          return (
            <DashboardPricesItem
              isPreferredPainter={isPreferredPainter}
              acceptQuoteButtonProps={{
                onTap: () =>
                  onAcceptQuote(
                    price.painterId,
                    price.amount
                  ),
              }}
              agentInfo={agentInfo}
              {...price}
            />
          );
        })
      )}
      <div
        className={cx(
          'flex flex-row items-center gap-3.5 text-xs font-medium text-gray-7',
          'border',
          'border-gray-11',
          'px-5',
          'py-4',
          'rounded-lg'
        )}
      >
        <IconsAcceptQuote />
        <span>
          To accept the quote you need to make a 10% deposit
          to secure contractors time through Stripe Payment.
        </span>
      </div>
    </div>
  );
};
