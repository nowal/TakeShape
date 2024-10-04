'use client';
import { DashboardPainterQuotes } from '@/components/dashboard/painter/quotes';
import { DashboardPainterJobPreferences } from '@/components/dashboard/painter/quotes/job/preferences';
import { DashboardPainterWithSelect } from '@/components/dashboard/painter/with-select';
import { ComponentsDashboardShell } from '@/components/dashboard/shell';
import { FallbacksLoadingCircle } from '@/components/fallbacks/loading/circle';
import { useDashboardPainterCompleted } from '@/context/dashboard/painter/completed';

const CompletedQuotes = () => {
  const dashboardPainterCompleted =
    useDashboardPainterCompleted();
  const { isAuthLoading, jobs } = dashboardPainterCompleted;
  if (isAuthLoading) return <FallbacksLoadingCircle />;

  return (
    // <ComponentsDashboardShell>
      <DashboardPainterWithSelect>
        <DashboardPainterQuotes
          type="Completed"
          jobs={jobs}
          JobInfoFc={DashboardPainterJobPreferences}
        />
      </DashboardPainterWithSelect>
    // </ComponentsDashboardShell>
  );
};

export default CompletedQuotes;
