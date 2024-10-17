import type { FC } from 'react';
import {
  isMocks,
  MOCKS_PRICES,
} from '@/components/dashboard/homeowner/contractor-quotes/mocks';
import { DashboardPricesItem } from '@/components/dashboard/prices/item';
import { DashboardPricesItemRecommended } from '@/components/dashboard/prices/recommended';
import { useDashboard } from '@/context/dashboard/provider';
import { TPrice } from '@/types';
import { PainterCard } from '@/components/painter/card';

export type TDashboardHomeownerContractorQuotesListItemsProps =
  { prices?: TPrice[] };
export const DashboardHomeownerContractorQuotesListItems: FC<
  TDashboardHomeownerContractorQuotesListItemsProps
> = ({ prices: _prices }) => {
  const dashboard = useDashboard();
  const { preferredPainterUserIds, userData } = dashboard;
  const prices =
    _prices ??
    (isMocks() ? MOCKS_PRICES : userData?.prices ?? []);
  const isEmpty = !prices || prices.length === 0;

  if (isEmpty) {
    return null;
  }

  return (
    <ul className="flex flex-col items-stretch gap-2">
      {prices.map((price: TPrice, index) => {
        const isPreferredPainter =
          preferredPainterUserIds.includes(price.painterId);
        // console.log(
        //   `Price ${index}: Painter ID ${price.painterId}, isPreferredPainter: ${isPreferredPainter}`
        // );
        if (isPreferredPainter) {
          // console.log(
          //   'Rendering agent info for painter:',
          //   price.painterId
          // );
        }
        return (
          <DashboardPricesItem
            key={`${price.painterId}-${index}`}
            price={price}
            index={index}
            PainterCardFc={PainterCard}
          >
            {isPreferredPainter && (
              <DashboardPricesItemRecommended />
            )}
          </DashboardPricesItem>
        );
      })}
    </ul>
  );
};
