'use client';
import { useDashboardPainterAccepted } from '@/context/dashboard/painter/accepted';
import { DashboardPainterWithSelect } from '@/components/dashboard/painter/with-select';
import { DashboardPainterQuotes } from '@/components/dashboard/painter/quotes';
import { DashboardPainterJobAccepted } from '@/components/dashboard/painter/quotes/job/accepted';
import { FallbacksLoadingCircle } from '@/components/fallbacks/loading/circle';
import { ComponentsDashboardShell } from '@/components/dashboard/shell';

const AcceptedQuotes = () => {
  const dashboardPainterAccepted =
    useDashboardPainterAccepted();
  const { isAuthLoading, jobs } = dashboardPainterAccepted;

  if (isAuthLoading) return <FallbacksLoadingCircle />;

  return (
    // <ComponentsDashboardShell>
      <DashboardPainterWithSelect>
        <DashboardPainterQuotes
          type="Accepted"
          jobs={jobs}
          JobInfoFc={DashboardPainterJobAccepted}
        />
      </DashboardPainterWithSelect>
    // </ComponentsDashboardShell>
  );
};

export default AcceptedQuotes;
