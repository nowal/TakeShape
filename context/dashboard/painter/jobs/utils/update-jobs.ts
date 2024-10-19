import { TJob, TJobs } from '@/types/jobs';

export const updateJobs =
  (job: TJob) => (prevJobs: TJobs) => {
    if (
      !prevJobs.some(({ jobId }) => jobId === job.jobId)
    ) {
      return [...prevJobs, job];
    }
    return prevJobs;
  };
