'use client';
import { DashboardPainterJobs } from '@/components/dashboard/painter/jobs';
import { DashboardPainterJobAccepted } from '@/components/dashboard/painter/jobs/job/accepted';
import { useDashboardPainterNavigatingDone } from '@/context/dashboard/painter/navigating-done';

const AcceptedQuotes = () => {
  useDashboardPainterNavigatingDone();

  return (
    <DashboardPainterJobs
      typeKey="accepted"
      JobInfoFc={DashboardPainterJobAccepted}
    />
  );
};

export default AcceptedQuotes;
