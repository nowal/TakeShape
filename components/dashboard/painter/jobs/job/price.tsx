import type { FC } from 'react';
import { TJob } from '@/types/jobs';
import { cx } from 'class-variance-authority';
import { DashboardPainterJobInvoice } from '@/components/dashboard/painter/jobs/job/invoice';
import { getAuth } from 'firebase/auth';

type TProps = TJob;
export const DashboardPainterJobPrice: FC<TProps> = (
  job
) => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  const price = job.prices
    .find((value) => value.painterId === user?.uid)
    ?.amount.toFixed(2);
  if (!price) return null;
  return (
    <div
      className={cx(
        'flex flex-col gap-2',
        'px-4.5 py-3.5',
        'text-sm text-green-3 bg-white-green-1',
        'rounded-lg'
      )}
    >
      <div className="flex flex-row items-center gap-2.5">
        <div className="text-xs text-semibold">
          Your Quote
        </div>
        <DashboardPainterJobInvoice {...job} />
      </div>
      <div className="font-medium text-3.5xl leading-none">
        ${Number(price).toLocaleString()}
      </div>
    </div>
  );
};
