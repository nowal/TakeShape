'use client';
import { useDashboardPainterAccepted } from '@/hooks/pages/acceptedQuotes';
import { DashboardPainterWithSelect } from '@/components/dashboard/painter/with-select';
import { DashboardPainterQuotes } from '@/components/dashboard/painter/quotes';
import { DashboardPainterJobAccepted } from '@/components/dashboard/painter/quotes/job/accepted';
import { FallbacksLoadingCircleCenter } from '@/components/fallbacks/loading/circle/center';

const AcceptedQuotes = () => {
  const dashboardPainterAccepted =
    useDashboardPainterAccepted();
  const { isAuthLoading, jobs } = dashboardPainterAccepted;
  if (isAuthLoading)
    return <FallbacksLoadingCircleCenter />;

  return (
    <DashboardPainterWithSelect>
      <DashboardPainterQuotes
        type="Accepted"
        jobs={jobs}
        JobInfoFc={DashboardPainterJobAccepted}
      />
    </DashboardPainterWithSelect>
  );
};

export default AcceptedQuotes;
