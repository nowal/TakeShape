import type { FC } from 'react';
import { DashboardPainterJobForm } from '@/components/dashboard/painter/quotes/job/available/form';
import { TJob } from '@/types';
import { DashboardPreferences } from '@/components/dashboard/preferences';

type TProps = TJob;

export const DashboardPainterJob: FC<TProps> = (job) => {
  return (
    <div className='bg-red'>
      <DashboardPreferences {...job} />
      <DashboardPainterJobForm {...job} />
    </div>
  );
};
