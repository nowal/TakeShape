import { collection, getDocs } from 'firebase/firestore';
import { notifyError } from '@/utils/notifications';
import { useAddressGeocodeHandler } from '@/hooks/address/geocode';
import { useWithinRangeCheckHandler } from '@/context/dashboard/painter/within-range-check';
import { fetchPainter } from '@/context/dashboard/painter/jobs/utils/painter-data';
import { TJob, TUnfilteredJob } from '@/types/jobs';
import { usePainterJobsState } from '@/context/dashboard/painter/jobs/state';
import { TFirestoreSnapshot } from '@/types/firestore/snapshot';
import { useJobCoords } from '@/context/dashboard/painter/jobs/hooks/job-coords';
import { resolveFirestoreAttribute } from '@/utils/firestore/attribute';
import { isUnquoted } from '@/context/dashboard/painter/jobs/utils/unquoted';
import { transformVideo } from '@/context/dashboard/painter/jobs/utils/video';
import { resolveJobFromDoc } from '@/context/dashboard/painter/jobs/utils/job-from-doc';
import { isTruthy } from '@/utils/validation/is/truthy';

export const usePainterJobsAvailable = () => {
  const handleAddressGeocode = useAddressGeocodeHandler();
  const handleWithinRangeCheck =
    useWithinRangeCheckHandler();
  const painterJobsState = usePainterJobsState();
  const { firestore, dispatchFetching, dispatchJobs } =
    painterJobsState;
  const handleJobCoords = useJobCoords();

  const handler = async () => {
    try {
      dispatchFetching(true);
      const painterResult = await fetchPainter();
      if (!painterResult) return;

      const { data: painter, user } = painterResult;
      const userImagesQuery = collection(
        firestore,
        'userImages'
      );
      const userImagesSnapshot: TFirestoreSnapshot =
        await getDocs(userImagesQuery);

      const resolveJob = async (
        jobData: TJob
      ): Promise<TUnfilteredJob> => {
        const jobCoords = await handleJobCoords(jobData);

        if (!jobCoords) {
          console.error('No job coords');
          return;
        }

        const painterCoords = await handleAddressGeocode(
          painter.address
        );

        if (!painterCoords) {
          console.error('No painter coords');
          return;
        }

        const isWithinRange = await handleWithinRangeCheck(
          painterCoords,
          jobCoords,
          painter.range
        );

        if (isWithinRange) {
          console.error('Is not within range');
          return;
        }

        jobData = await resolveFirestoreAttribute<TJob>(
          jobData,
          'paintPreferences',
          jobData.paintPreferencesId
        );

        jobData = await transformVideo(jobData);

        return jobData;
      };

      const jobs = userImagesSnapshot.docs.map((jobDoc) =>
        resolveJobFromDoc(jobDoc, resolveJob)
      );
      for await (const job of jobs) {
        if (isTruthy(job)) {
          if (isUnquoted(user.uid, job.prices)) {
            dispatchJobs((prev) => [...prev, job]);
          }
        }
      }
    } catch (error) {
      const errorMessage = 'Error fetching painter data';
      notifyError(errorMessage);
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
