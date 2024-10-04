import type { FC } from 'react';
import { ButtonsCvaAnchor } from '@/components/cva/anchor';
import { TJob } from '@/types';
import { useDashboardPainter } from '@/context/dashboard/painter/provider';

type TProps = TJob;
export const DashboardPainterJobInvoice: FC<TProps> = (
  job
) => {
  const title = 'Invoice';
  const dashboardPainter = useDashboardPainter();
  const { user } = dashboardPainter;
  const invoiceUrl = job.prices.find(
    (price) => price.painterId === user?.uid
  )?.invoiceUrl;
  return (
    <ButtonsCvaAnchor
      href={invoiceUrl}
      target="_blank"
      rel="noopener noreferrer"
      classValue="mt-0.25"
      title={title}
    >
      <div className="text-black text-xs font-semibold p-0.5">
        {title}
      </div>
    </ButtonsCvaAnchor>
  );
};
