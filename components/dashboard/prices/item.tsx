import type { FC } from 'react';
import { PainterCard } from '@/components/painter-card';
import { TAgentInfo, TPrice } from '@/types/types';
import { cx } from 'class-variance-authority';
import { DashboardPricesItemFooter } from '@/components/dashboard/prices/footer';
import { LinesHorizontalLight } from '@/components/lines/horizontal/light';
import { useDashboard } from '@/context/dashboard/provider';
import { DashboardPricesItemRecommended } from '@/components/dashboard/prices/recommended';
import { TElementProps } from '@/types/dom';

type TProps = TPrice & TElementProps
export const DashboardPricesItem: FC<TProps> = ({
  children,
  ...price
}) => {
  const dashboard = useDashboard();
  const {
    userData,
    onAcceptQuote,
    preferredPainterUserIds,
    agentInfo,
  } = dashboard;
  return (
    <li
      className={cx(
        'flex flex-col items-stretch',
        'border',
        'border-gray-11',
        'rounded-lg'
      )}
    >
      <div className="flex flex-row items-center justify-between">
        <PainterCard painterId={price.painterId} />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col">
            <p className="flex flex-row items-start text-2xl font-medium">
              <span className="text-base">$</span>
              <span>{price.amount.toFixed(2)}</span>
            </p>
          
            {children}
            <DashboardPricesItemRecommended />
          </div>
        </div>
      </div>
      <LinesHorizontalLight colorClass="border-gray-3" />
      <DashboardPricesItemFooter {...price} />
    </li>
  );
};
