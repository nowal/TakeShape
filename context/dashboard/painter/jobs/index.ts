import { usePainterJobsAccepted } from '@/context/dashboard/painter/jobs/accepted';
import { usePainterJobsAvailable } from '@/context/dashboard/painter/jobs/available';
import { usePainterJobsCompleted } from '@/context/dashboard/painter/jobs/completed';

export const usePainterJobs = () => {
  const available = usePainterJobsAvailable();
  const accepted = usePainterJobsAccepted();
  const completed = usePainterJobsCompleted();

  return {
    available,
    accepted,
    completed,
  };
};
