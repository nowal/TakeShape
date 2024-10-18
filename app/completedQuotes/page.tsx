'use client';
import { DashboardPainterJobs } from '@/components/dashboard/painter/jobs';
import { DashboardPreferences } from '@/components/dashboard/preferences';
import { DashboardPainterWithSelect } from '@/components/dashboard/painter/with-select';
import { FallbacksLoadingCircle } from '@/components/fallbacks/loading/circle';
import { usePainterJobsCompleted } from '@/context/dashboard/painter/jobs/completed';

const CompletedQuotes = () => {
  const dashboardPainterCompleted =
    usePainterJobsCompleted();
  const { isAuthLoading, jobs } = dashboardPainterCompleted;
  if (isAuthLoading) return <FallbacksLoadingCircle />;

  return (
    <DashboardPainterWithSelect>
      <DashboardPainterJobs
        type="Completed"
        jobs={jobs}
        JobInfoFc={DashboardPreferences}
      />
    </DashboardPainterWithSelect>
  );
};

export default CompletedQuotes;
