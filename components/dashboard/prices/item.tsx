import type { FC } from 'react';
import { PainterCard } from '@/components/painter-card';
import { TPrice } from '@/types';
import { cx } from 'class-variance-authority';
import { DashboardPricesItemFooter } from '@/components/dashboard/prices/footer';
import { LinesHorizontalLight } from '@/components/lines/horizontal/light';
import { DashboardPricesItemRecommended } from '@/components/dashboard/prices/recommended';
import { TElementProps } from '@/types/dom';

type TProps = TPrice & TElementProps
export const DashboardPricesItem: FC<TProps> = ({
  children,
  ...price
}) => {
  return (
    <li
      className={cx(
        'flex flex-col items-stretch',
        'border',
        'border-gray-11',
        'rounded-lg'
      )}
    >
      <div className={cx("flex flex-col items-stretch justify-between xs:flex-row lg:items-start", "px-6 pt-6 pb-2")}>
        <PainterCard painterId={price.painterId} />
        <div className={cx("flex flex-col items-stretch xs:flex-row xs:items-start justify-between gap-4")}>
          <div className="flex flex-col items-end gap-2">
            <p className="flex flex-row items-start text-2xl gap-1 font-medium">
              <span className="relative top-[2px] text-sm">$</span>
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
