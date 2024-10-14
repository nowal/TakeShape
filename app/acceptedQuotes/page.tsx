'use client';
import { useDashboardPainterAccepted } from '@/app/acceptedQuotes/accepted';
import { DashboardPainterWithSelect } from '@/components/dashboard/painter/with-select';
import { DashboardPainterQuotes } from '@/components/dashboard/painter/quotes';
import { DashboardPainterJobAccepted } from '@/components/dashboard/painter/quotes/job/accepted';
import { FallbacksLoadingCircle } from '@/components/fallbacks/loading/circle';

const AcceptedQuotes = () => {
  const dashboardPainterAccepted =
    useDashboardPainterAccepted();
  const { isAuthLoading, jobs } = dashboardPainterAccepted;
  if (isAuthLoading) return <FallbacksLoadingCircle />;

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
