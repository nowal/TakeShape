import type { FC } from 'react';
import { DashboardPainterJob } from '@/components/dashboard/painter/quotes/job';
import { NotificationsHighlight } from '@/components/notifications/highlight';
import { useDashboardPainter } from '@/context/dashboard/painter/provider';

type TProps = {
  type?: 'Available' | 'Completed' | 'Accepted';
};
export const DashboardPainterQuotes: FC<TProps> = ({
  type,
}) => {
  const { jobs } = useDashboardPainter();
  if (!jobs) return null;
  return (
    <>
      {jobs.length > 0 ? (
        jobs.map((job) => (
          <DashboardPainterJob key={job.jobId} job={job} />
        ))
      ) : (
        <NotificationsHighlight>
          No {type} Quotes at this time
        </NotificationsHighlight>
      )}
    </>
  );
};
