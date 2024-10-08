'use client';
import { DashboardPainterQuotes } from '@/components/dashboard/painter/quotes';
import { DashboardPreferences } from '@/components/dashboard/preferences';
import { DashboardPainterWithSelect } from '@/components/dashboard/painter/with-select';
import { FallbacksLoadingCircle } from '@/components/fallbacks/loading/circle';
import { useDashboardPainterCompleted } from '@/context/dashboard/painter/completed';

const CompletedQuotes = () => {
  const dashboardPainterCompleted =
    useDashboardPainterCompleted();
  const { isAuthLoading, jobs } = dashboardPainterCompleted;
  if (isAuthLoading) return <FallbacksLoadingCircle />;

  return (
    <DashboardPainterWithSelect>
      <DashboardPainterQuotes
        type="Completed"
        jobs={jobs}
        JobInfoFc={DashboardPreferences}
      />
    </DashboardPainterWithSelect>
  );
};

export default CompletedQuotes;
