'use client';

import { useDashboardPainterAccepted } from '@/context/dashboard/painter/accepted';
import { useDashboardPainter } from '@/context/dashboard/painter/provider';
import { DashboardPainterWithSelect } from '@/components/dashboard/painter/with-select';
import { NotificationsHighlight } from '@/components/notifications/highlight';
import { ComponentsDashboardShell } from '@/components/dashboard/shell';
import { DashboardPainterJob } from '@/components/dashboard/painter/quotes/job';

const AcceptedQuotes = () => {
  const dashboardPainter = useDashboardPainter();
  const { jobs, user } = dashboardPainter;
  const dashboardPainterAccepted =
    useDashboardPainterAccepted();
  const { authLoading } = dashboardPainterAccepted;

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
                No Accepted Quotes at this time
              </NotificationsHighlight>
            )}
          </DashboardPainterWithSelect>
        )
      }
    />
  );
};

export default AcceptedQuotes;
