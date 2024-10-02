import type { FC } from 'react';
import { useDashboardPainter } from '@/context/dashboard/painter/provider';
import { TJob } from '@/types';

type TProps = TJob;

export const DashboardPainterJobFormPrice: FC<TProps> = (
  job
) => {
  const dashboardPainter = useDashboardPainter();
  const { user } = dashboardPainter;
  const price = job.prices
    .find((price) => price.painterId === user?.uid)
    ?.amount.toFixed(2);
  return (
    <div>
      {price && (
        <div className="flex flex-row gap-1">
          <span>Your Quoted Price:</span>
          <span className="text-xl">${price}</span>
        </div>
      )}
    </div>
  );
};
