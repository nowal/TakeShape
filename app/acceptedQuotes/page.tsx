'use client';
import { useDashboardPainterAccepted } from '@/context/dashboard/painter/accepted';
import { DashboardPainterWithSelect } from '@/components/dashboard/painter/with-select';
import { ComponentsDashboardShell } from '@/components/dashboard/shell';
import { DashboardPainterQuotes } from '@/components/dashboard/painter/quotes';
import { DashboardPainterJobFormAccepted } from '@/components/dashboard/painter/quotes/job/form/accepted';
import { FallbacksLoadingCircle } from '@/components/fallbacks/loading/circle';

const AcceptedQuotes = () => {
  const dashboardPainterAccepted =
    useDashboardPainterAccepted();
  const { isAuthLoading, jobs } = dashboardPainterAccepted;

  return (
    <ComponentsDashboardShell
      key="ComponentsDashboardShell"
      first={
        isAuthLoading ? (
          <FallbacksLoadingCircle />
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
