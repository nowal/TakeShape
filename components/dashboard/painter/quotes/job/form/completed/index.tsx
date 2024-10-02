import type { FC } from 'react';
import { TJob } from '@/types';
import { DashboardPainterJobFormPreferences } from '@/components/dashboard/painter/quotes/job/form/preferences';
import { DashboardPainterJobFormCompletedInvoice } from '@/components/dashboard/painter/quotes/job/form/completed/invoice';
import { DashboardPainterJobFormPrice } from '@/components/dashboard/painter/quotes/job/form/price';

type TProps = TJob;
export const DashboardPainterJobFormCompleted: FC<
  TProps
> = (job) => {
  return (
    <div>
      <DashboardPainterJobFormPrice {...job} />
      <DashboardPainterJobFormCompletedInvoice {...job} />
      <DashboardPainterJobFormPreferences
        {...job}
      />
    </div>
  );
};
