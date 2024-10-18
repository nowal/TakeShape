import { DashboardPainterJobs } from '@/components/dashboard/painter/jobs';
import { DashboardPainterJobAvailable } from '@/components/dashboard/painter/jobs/job/available';
import { DashboardPainterWithSelect } from '@/components/dashboard/painter/with-select';
import { usePainterJobsAvailable } from '@/context/dashboard/painter/jobs/available';

export const DashboardPainter = () => {
  const painterJobsAvailable = usePainterJobsAvailable();
  const { jobs } = painterJobsAvailable;

  return (
    <DashboardPainterWithSelect>
      <DashboardPainterJobs
        type="Available"
        jobs={jobs}
        JobInfoFc={DashboardPainterJobAvailable}
      />
    </DashboardPainterWithSelect>
  );
};
