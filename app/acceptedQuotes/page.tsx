'use client';
import { useDashboardPainterAccepted } from '@/context/dashboard/painter/accepted';
import { DashboardPainterWithSelect } from '@/components/dashboard/painter/with-select';
import { NotificationsHighlight } from '@/components/notifications/highlight';
import { ComponentsDashboardShell } from '@/components/dashboard/shell';
import { DashboardPainterQuotes } from '@/components/dashboard/painter/quotes';
import { DashboardPainterJobForm } from '@/components/dashboard/painter/quotes/job/form';

const AcceptedQuotes = () => {
  const dashboardPainterAccepted =
    useDashboardPainterAccepted();
  const { authLoading, jobs } = dashboardPainterAccepted;

  return (
    <ComponentsDashboardShell
      key="ComponentsDashboardShell"
      left={
        authLoading ? (
          <NotificationsHighlight>
            Retrieving Information...
          </NotificationsHighlight>
        ) : (
          <DashboardPainterWithSelect>
            <DashboardPainterQuotes
              type="Accepted"
              jobs={jobs}
              JobInfoFc={DashboardPainterJobForm}
            />
          </DashboardPainterWithSelect>
        )
      }
    />
  );
};

export default AcceptedQuotes;
