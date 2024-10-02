import type { FC } from 'react';
import { TJob } from '@/types';
import { useDashboardPainter } from '@/context/dashboard/painter/provider';

type TProps = TJob;

export const DashboardPainterJobFormCompletedInvoice: FC<TProps> = (job) => {
  const dashboardPainter = useDashboardPainter();
  const { user } = dashboardPainter;
  return (
    <div>
      {job.prices.find(
        (price) => price.painterId === user?.uid
      )?.invoiceUrl && (
        <a
          href={
            job.prices.find(
              (price) => price.painterId === user?.uid
            )?.invoiceUrl
          }
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline ml-2"
        >
          Invoice
        </a>
      )}
    </div>
  );
};
