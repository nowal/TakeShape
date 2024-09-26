'use client';

import { DashboardPainterJob } from '@/components/dashboard/painter/quotes/job';
import { DashboardPainterWithSelect } from '@/components/dashboard/painter/with-select';
import { ComponentsDashboardShell } from '@/components/dashboard/shell';
import { NotificationsHighlight } from '@/components/notifications/highlight';
import { useDashboardPainterCompleted } from '@/context/dashboard/painter/completed';
import { useDashboardPainter } from '@/context/dashboard/painter/provider';

const CompletedQuotes = () => {
  const dashboardPainter = useDashboardPainter();
  const { jobs, user } = dashboardPainter;
  const dashboardPainterCompleted =
    useDashboardPainterCompleted();
  const { authLoading } = dashboardPainterCompleted;

  return (
    <ComponentsDashboardShell
      left={
        authLoading ? (
          <NotificationsHighlight>
            Retrieving Information...
          </NotificationsHighlight>
        ) : (
          <DashboardPainterWithSelect>
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <DashboardPainterJob
                  key={job.jobId}
                  job={job}
                />
              ))
            ) : (
              <NotificationsHighlight>
                No Completed Quotes at this time
              </NotificationsHighlight>
            )}
          </DashboardPainterWithSelect>
        )
      }
    />
  );
};

export default CompletedQuotes;
