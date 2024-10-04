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
        <div className='flex flex-col items-stretch gap-3'>
          {jobs.map((job) => (
            <DashboardPainterJob
              key={job.jobId}
              job={job}
              JobInfoFc={JobInfoFc}
            />
          ))}
        </div>
      ) : (
        <NotificationsHighlight>
          No {type} Quotes at this time
        </NotificationsHighlight>
      )}
    </>
  );
};
