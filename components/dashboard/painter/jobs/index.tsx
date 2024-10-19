import type { FC } from 'react';
import { DashboardPainterJob } from '@/components/dashboard/painter/jobs/job';
import { useDashboardPainter } from '@/context/dashboard/painter/provider';
import { DashboardPainterWithSelect } from '@/components/dashboard/painter/with-select';
import { TJobTypeProps } from '@/components/dashboard/painter/types';
import { DashboardPainterJobsEmpty } from '@/components/dashboard/painter/jobs/empty';
import { TJob } from '@/types/jobs';
import { DashboardPainterJobsShowMore } from '@/components/dashboard/painter/jobs/show-more';

type TProps = TJobTypeProps & {
  JobInfoFc: FC<TJob>;
};
export const DashboardPainterJobs: FC<TProps> = ({
  JobInfoFc,
  ...jobTypeProps
}) => {
  const dashboardPainter = useDashboardPainter();
  const { jobs, count, isFetching, isInitRef } =
    dashboardPainter[jobTypeProps.typeKey];

  return (
    <DashboardPainterWithSelect {...jobTypeProps}>
      {jobs.length > 0 ? (
        <div
          className="flex flex-col items-stretch gap-3"
          {...jobTypeProps}
        >
          {jobs.slice(0, count).map((job: TJob) => (
            <DashboardPainterJob
              key={job.jobId}
              job={job}
              JobInfoFc={JobInfoFc}
            />
          ))}
          <DashboardPainterJobsShowMore {...jobTypeProps} />
        </div>
      ) : (
        <>
          {isFetching || !isInitRef.current ? null : (
            <DashboardPainterJobsEmpty {...jobTypeProps} />
          )}
        </>
      )}
    </DashboardPainterWithSelect>
  );
};
