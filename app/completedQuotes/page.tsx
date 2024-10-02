'use client';;
import { DashboardPainterQuotes } from '@/components/dashboard/painter/quotes';
import { DashboardPainterJobFormCompleted } from '@/components/dashboard/painter/quotes/job/form/completed';
import { DashboardPainterWithSelect } from '@/components/dashboard/painter/with-select';
import { ComponentsDashboardShell } from '@/components/dashboard/shell';
import { NotificationsHighlight } from '@/components/notifications/highlight';
import { useDashboardPainterCompleted } from '@/context/dashboard/painter/completed';

const CompletedQuotes = () => {
  const dashboardPainterCompleted =
    useDashboardPainterCompleted();
  const { isAuthLoading, jobs } = dashboardPainterCompleted;

  return (
    <ComponentsDashboardShell
      key="ComponentsDashboardShell"
      first={
        isAuthLoading ? (
          <NotificationsHighlight>
            Retrieving Information...
          </NotificationsHighlight>
        ) : (
          <DashboardPainterWithSelect>
            <DashboardPainterQuotes
              type="Completed"
              jobs={jobs}
              JobInfoFc={DashboardPainterJobFormCompleted}
            />
          </DashboardPainterWithSelect>
        )
      }
    />
  );
};

export default CompletedQuotes;
