'use client';
import { usePainterJobsAccepted } from '@/context/dashboard/painter/jobs/accepted';
import { DashboardPainterWithSelect } from '@/components/dashboard/painter/with-select';
import { DashboardPainterJobs } from '@/components/dashboard/painter/jobs';
import { DashboardPainterJobAccepted } from '@/components/dashboard/painter/jobs/job/accepted';
import { FallbacksLoadingCircleCenter } from '@/components/fallbacks/loading/circle/center';

const AcceptedQuotes = () => {
  const dashboardPainterAccepted = usePainterJobsAccepted();
  const { isAuthLoading, jobs } = dashboardPainterAccepted;
  if (isAuthLoading)
    return <FallbacksLoadingCircleCenter />;

  return (
    <DashboardPainterWithSelect>
      <DashboardPainterJobs
        type="Accepted"
        jobs={jobs}
        JobInfoFc={DashboardPainterJobAccepted}
      />
    </DashboardPainterWithSelect>
  );
};

export default AcceptedQuotes;
