import { getDoc, doc } from 'firebase/firestore';
import { fetchPainter } from '@/context/dashboard/painter/jobs/utils/painter-data';
import { isTruthy } from '@/utils/validation/is/truthy';
import { TJob } from '@/types/jobs';
import { usePainterJobsState } from '@/context/dashboard/painter/jobs/state';
import { fetchUser } from '@/context/dashboard/painter/jobs/utils/user';
import { resolveFirestoreAttribute } from '@/utils/firestore/attribute';
import { TFirestoreDocumentSnapshot } from '@/types/firestore/snapshot';
import { transformVideo } from '@/context/dashboard/painter/jobs/utils/video';

export const usePainterJobsAccepted = () => {
  const painterJobsState = usePainterJobsState();
  const { firestore, dispatchFetching, dispatchJobs } =
    painterJobsState;

  const handler = async () => {
    try {
      dispatchFetching(true);
      const painterDataResult = await fetchPainter();
      if (!painterDataResult) return;
      const { data: painterData } = painterDataResult;
      if (
        !painterData.acceptedQuotes ||
        painterData.acceptedQuotes.length === 0
      ) {
        console.error(
          'No accepted quotes found, unable to fetch painter data.'
        );
        return;
      }
      const resolveJob = async (
        acceptedQuoteId: string
      ) => {
        if (!acceptedQuoteId) {
          console.error(
            'Invalid acceptedQuoteId: ',
            acceptedQuoteId
          );
          return;
        }
        const jobRef = doc(
          firestore,
          'userImages',
          acceptedQuoteId
        );
        const jobSnapshot = await getDoc(jobRef);
        if (jobSnapshot.exists()) {
          let jobData = {} as TJob;

          const fetchPaintPreferences = async (
            jobSnapshot: TFirestoreDocumentSnapshot
          ) => {
            let jobData = jobSnapshot.data() as TJob;

            jobData = await resolveFirestoreAttribute<TJob>(
              jobData,
              'paintPreferences',
              jobData.paintPreferencesId
            );

            return jobData;
          };

          const fetchPaintPreferencesResult =
            await fetchPaintPreferences(jobSnapshot);

          jobData = {
            ...(fetchPaintPreferencesResult ?? {}),
          };

          const fetchUserResult = await fetchUser(jobData);

          jobData = {
            ...(fetchUserResult ?? {}),
            ...jobData,
          };

          jobData = await transformVideo(jobData);

          return {
            ...jobData,
            jobId: jobSnapshot.id,
          };
        }
        return;
      };
      const jobs: Promise<TJob | undefined>[] =
        painterData.acceptedQuotes.map(resolveJob);
      for await (const job of jobs) {
        if (isTruthy(job)) {
          dispatchJobs((prev) => [...prev, job]);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      dispatchFetching(false);
    }
  };

  return {
    onFetch: handler,
    ...painterJobsState,
  };
};
