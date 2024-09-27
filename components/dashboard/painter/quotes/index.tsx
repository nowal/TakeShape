import type { FC } from 'react';
import { DashboardPainterJob } from '@/components/dashboard/painter/quotes/job';
import { NotificationsHighlight } from '@/components/notifications/highlight';
import { TJob } from '@/types';

type TProps = {
  type?: 'Available' | 'Completed' | 'Accepted';
  jobs: TJob[];
  JobInfoFc: FC<TJob>;
};
export const DashboardPainterQuotes: FC<TProps> = ({
  type,
  jobs,
  JobInfoFc,
}) => {
  if (!jobs) return null;
  return (
    <>
      {jobs.length > 0 ? (
        <>
          {jobs.map((job) => (
            <DashboardPainterJob
              key={job.jobId}
              job={job}
              JobInfoFc={JobInfoFc}
            />
          ))}
        </>
      ) : (
        <NotificationsHighlight>
          No {type} Quotes at this time
        </NotificationsHighlight>
      )}
    </>
  );
};
