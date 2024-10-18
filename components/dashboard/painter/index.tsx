import { DashboardPainterJobs } from '@/components/dashboard/painter/jobs';
import { DashboardPainterJobAvailable } from '@/components/dashboard/painter/jobs/job/available';

export const DashboardPainter = () => {
  return (
    <DashboardPainterJobs
      typeKey="available"
      JobInfoFc={DashboardPainterJobAvailable}
    />
  );
};
