import type { FC } from 'react';
import {
  DashboardPricesItem,
  TDashboardPricesItemProps,
} from '@/components/dashboard/prices/item';
import { DashboardPricesItemRecommended } from '@/components/dashboard/prices/recommended';
import { useDashboard } from '@/context/dashboard/provider';

type TProps = TDashboardPricesItemProps;
export const LandingBenefitsReceieveQuotesItem: FC<
  TProps
> = (props) => {
  const { price, ...rest } = props;
  const dashboard = useDashboard();
  const { preferredPainterUserIds } = dashboard;
  const isPreferredPainter =
    preferredPainterUserIds.includes(price.painterId);

  if (isPreferredPainter) {
    console.log(
      'Rendering agent info for painter:',
      price.painterId
    );
  }
  
  return (
    <DashboardPricesItem price={price} {...rest}>
      {isPreferredPainter && (
        <DashboardPricesItemRecommended />
      )}
    </DashboardPricesItem>
  );
};
