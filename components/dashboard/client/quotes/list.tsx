import type { FC } from 'react';
import { DashboardPricesItem } from '@/components/dashboard/prices/item';
import { NotificationsHighlight } from '@/components/notifications/highlight';
import { useDashboard } from '@/context/dashboard/provider';
import {
  isMocks,
  MOCKS_PRICES,
} from '@/components/dashboard/client/quotes/mocks';
import { DashboardClientQuotesAccept } from '@/components/dashboard/client/quotes/accept';
import { DashboardPricesItemRecommended } from '@/components/dashboard/prices/recommended';

export const DashboardClientQuotesList: FC = () => {
  const dashboard = useDashboard();
  const { preferredPainterUserIds, agentInfo, userData } =
    dashboard;

  const prices = isMocks()
    ? MOCKS_PRICES
    : userData?.prices ?? [];
  console.log('Rendering quotes with prices:', prices);
  console.log('Agent info:', agentInfo);
  const isGathering = !prices || prices.length === 0;

  return (
    <div className="flex flex-col items-stretch">
      <div className="h-2" />
      <h3 className="typography-form-title text-left">
        Contractor Quotes
      </h3>
      <div className="h-5" />

      {isGathering ? (
        <NotificationsHighlight>
          <>Gathering Quotes...</>
        </NotificationsHighlight>
      ) : (
        <ul className="flex flex-col items-stretch gap-2">
          {prices.map((price, index) => {
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
                key={`${price.painterId}-${index}`}
                {...price}
              >
                {isPreferredPainter && (
                  <DashboardPricesItemRecommended />
                )}
              </DashboardPricesItem>
            );
          })}
        </ul>
      )}
      <div className="h-4" />
      <DashboardClientQuotesAccept />
    </div>
  );
};
