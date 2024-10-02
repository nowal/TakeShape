import type { FC } from 'react';
import { TJob } from '@/types';
import { ComponentsDashboardShell } from '@/components/dashboard/shell';

export type TDashboardPainterJobProps = {
  job: TJob;
  JobInfoFc?: FC<TJob>;
};
export const DashboardPainterJob: FC<
  TDashboardPainterJobProps
> = ({ job, JobInfoFc }) => {
  console.log('job ', job);
  return (
    <ComponentsDashboardShell
      first={
        <video
          src={`${job.video}#t=0.001`}
          autoPlay
          controls
          playsInline
          muted={true}
          className="w-full lg:w-96"
        />
      }
      second={<>{JobInfoFc && <JobInfoFc {...job} />}</>}
    />
  );
};
