import type { FC } from 'react';
import { TJob } from '@/types/jobs';
import { ComponentsDashboardLayout } from '@/components/dashboard/layout';
import { DashboardPainterJobPrice } from '@/components/dashboard/painter/jobs/job/price';
import { cx } from 'class-variance-authority';

export type TDashboardPainterJobProps = {
  job: TJob;
  JobInfoFc?: FC<TJob>;
};
export const DashboardPainterJob: FC<
  TDashboardPainterJobProps
> = ({ job, JobInfoFc }) => {
  return (
    <ComponentsDashboardLayout
      first={
        <div className="flex flex-col items-stretch gap-4">
          <video
            src={`${job.video}#t=0.001`}
            controls
            muted
            className="w-full rounded-xl"
          />
          <DashboardPainterJobPrice {...job} />
        </div>
      }
      second={
        <div className="pl-2">
          {JobInfoFc && <JobInfoFc {...job} />}
        </div>
      }
      backgroundProps={{
        classValue: cx(
          'rounded-2xl border border-gray-14 bg-white shadow-08',
          'pl-6 py-6 pr-7.5'
        ),
      }}
    />
  );
};
