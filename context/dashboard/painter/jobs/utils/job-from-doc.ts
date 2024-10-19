import { TFirestoreDocumentSnapshot } from '@/types/firestore/snapshot';
import { TJob } from '@/types/jobs';

export const resolveJobFromDoc = async (
  jobDoc: TFirestoreDocumentSnapshot,
  resolveJob: (job: TJob) => Promise<TJob | undefined>
) => {
  const jobData = jobDoc.data() as TJob;
  const job = await resolveJob(jobData);
  if (job) {
    return {
      ...job,
      jobId: jobDoc.id,
    };
  }
};
