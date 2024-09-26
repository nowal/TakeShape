'use client';

import { DashboardPainterQuotes } from '@/components/dashboard/painter/quotes';
import { DashboardPainterWithSelect } from '@/components/dashboard/painter/with-select';
import { ComponentsDashboardShell } from '@/components/dashboard/shell';
import { NotificationsHighlight } from '@/components/notifications/highlight';
import { useDashboardPainterCompleted } from '@/context/dashboard/painter/completed';

const CompletedQuotes = () => {
  const dashboardPainterCompleted =
    useDashboardPainterCompleted();
  const { authLoading } = dashboardPainterCompleted;

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
            <DashboardPainterQuotes type="Completed" />
          </DashboardPainterWithSelect>
        )
      }
    />
  );
};

export default CompletedQuotes;
