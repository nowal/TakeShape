'use client';;
import { useDashboardPainterAccepted } from '@/context/dashboard/painter/accepted';
import { DashboardPainterWithSelect } from '@/components/dashboard/painter/with-select';
import { NotificationsHighlight } from '@/components/notifications/highlight';
import { ComponentsDashboardShell } from '@/components/dashboard/shell';
import { DashboardPainterQuotes } from '@/components/dashboard/painter/quotes';
import { DashboardPainterJobFormAccepted } from '@/components/dashboard/painter/quotes/job/form/accepted';

const AcceptedQuotes = () => {
  const dashboardPainterAccepted =
    useDashboardPainterAccepted();
  const { authLoading, jobs } = dashboardPainterAccepted;

  return (
    <ComponentsDashboardShell
      key="ComponentsDashboardShell"
      first={
        authLoading ? (
          <NotificationsHighlight>
            Retrieving Information...
          </NotificationsHighlight>
        ) : (
          <DashboardPainterWithSelect>
            <DashboardPainterQuotes
              type="Accepted"
              jobs={jobs}
              JobInfoFc={DashboardPainterJobFormAccepted}
            />
          </DashboardPainterWithSelect>
        )
      }
    />
  );
};

export default AcceptedQuotes;
