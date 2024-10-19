import {
  collection,
  getDocs,
  getFirestore,
} from 'firebase/firestore';
import { useAddressGeocodeHandler } from '@/hooks/address/geocode';
import { useWithinRangeCheckHandler } from '@/context/dashboard/painter/within-range-check';
import { fetchPainter } from '@/context/dashboard/painter/jobs/utils/painter-data';
import { TJob } from '@/types/jobs';
import { usePainterJobsState } from '@/context/dashboard/painter/jobs/state';
import { resolveFirestoreAttribute } from '@/utils/firestore/attribute';
import { fetchUser } from '@/context/dashboard/painter/jobs/utils/user';
import { useJobCoords } from '@/context/dashboard/painter/jobs/hooks/job-coords';
import { resolveJobFromDoc } from '@/context/dashboard/painter/jobs/utils/job-from-doc';
import { transformVideo } from '@/context/dashboard/painter/jobs/utils/video';
import { isTruthy } from '@/utils/validation/is/truthy';
import { updateJobs } from '@/context/dashboard/painter/jobs/utils/update-jobs';

export const usePainterJobsCompleted = () => {
  const painterJobsState = usePainterJobsState();
  const { dispatchFetching, dispatchJobs } =
    painterJobsState;

  const handleAddressGeocode = useAddressGeocodeHandler();
  const handleWithinRangeCheck =
    useWithinRangeCheckHandler();
  const handleJobCoords = useJobCoords();

  const handler = async () => {
    try {
      dispatchFetching(true);
      const painterDataResult = await fetchPainter();
      if (!painterDataResult) return;

      const { data: painterData } = painterDataResult;

      const firestore = getFirestore();

      const userImagesQuery = collection(
        firestore,
        'userImages'
      );

      const userImagesSnapshot = await getDocs(
        userImagesQuery
      );

      const resolveJob = async (jobData: TJob) => {
        if (!jobData.address) return;

        const jobCoords = await handleJobCoords(jobData);

        if (jobCoords === null) {
          console.error('No job coords');
          return;
        }

        const painterCoords = await handleAddressGeocode(
          jobData.address
        );

        if (painterCoords === null) {
          console.error('No painter coords');
          return;
        }

        const isWithinRange = await handleWithinRangeCheck(
          painterCoords,
          jobCoords,
          painterData.range
        );

        if (!isWithinRange) {
          console.error('Job out of range', jobData);
          return;
        }

        jobData = await resolveFirestoreAttribute<TJob>(
          jobData,
          'paintPreferences',
          jobData.paintPreferencesId
        );

        const fetchUserResult = await fetchUser(jobData);

        jobData = {
          ...(fetchUserResult ?? {}),
          ...jobData,
        };

        jobData = await transformVideo(jobData);

        return jobData;
      };

      const jobs = userImagesSnapshot.docs.map((jobDoc) =>
        resolveJobFromDoc(jobDoc, resolveJob)
      );
      for await (const job of jobs) {
        if (isTruthy(job)) {
          dispatchJobs(updateJobs(job));
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
