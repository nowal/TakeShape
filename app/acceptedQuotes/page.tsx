'use client';
import { DashboardPainterJobs } from '@/components/dashboard/painter/jobs';
import { DashboardPainterJobAccepted } from '@/components/dashboard/painter/jobs/job/accepted';

const AcceptedQuotes = () => {
  return (
    <DashboardPainterJobs
      typeKey="accepted"
      JobInfoFc={DashboardPainterJobAccepted}
    />
  );
};

export default AcceptedQuotes;
