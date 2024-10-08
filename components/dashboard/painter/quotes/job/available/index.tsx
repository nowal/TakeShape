import type { FC } from 'react';
import { DDashboardPainterJobAvailableForm } from '@/components/dashboard/painter/quotes/job/available/form';
import { TJob } from '@/types';
import { DashboardPreferences } from '@/components/dashboard/preferences';

type TProps = TJob;

export const DashboardPainterJobAvailable: FC<TProps> = (
  job
) => {
  return (
    <div className="flex flex-col items-stretch">
      <DashboardPreferences {...job} />
      <DDashboardPainterJobAvailableForm {...job} />
    </div>
  );
};
