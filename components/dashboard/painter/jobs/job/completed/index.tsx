import type { FC } from 'react';
import { TJob } from '@/types/jobs';
import { DashboardPreferences } from '@/components/dashboard/preferences';
import { DashboardPainterJobInvoice } from '@/components/dashboard/painter/jobs/job/invoice';
import { DashboardPainterJobPrice } from '@/components/dashboard/painter/jobs/job/price';

type TProps = TJob;
export const DashboardPainterJobCompleted: FC<TProps> = (
  job
) => {
  
  return (
    <>
      <DashboardPainterJobPrice {...job} />
      <DashboardPainterJobInvoice {...job} />
      <DashboardPreferences {...job} />
    </>
  );
};
