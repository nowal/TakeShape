import { useState } from 'react';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { notifyError } from '@/utils/notifications';
import { resolveVideoUrl } from '@/utils/video/url';
import { isDefined } from '@/utils/validation/is/defined';
import { useAddressGeocodeHandler } from '@/hooks/address/geocode';
import { useWithinRangeCheckHandler } from '@/context/dashboard/painter/within-range-check';
import { resolvePainterData } from '@/context/dashboard/painter/jobs/utils/painter-data';
import { isTruthy } from '@/utils/validation/is/truthy';
import { TJob } from '@/types/jobs';
import { TPaintPreferences } from '@/types/preferences';

export const usePainterJobsAvailable = () => {
  const handleGeocodeAddress = useAddressGeocodeHandler();
  const handleWithinRangeCheck =
    useWithinRangeCheckHandler();
  const [isFetching, setFetching] =
    useState<boolean>(false);
  const [jobs, setJobs] = useState<TJob[]>([]);
  const firestore = getFirestore();

  const handler = async () => {
    try {
      setFetching(true);
      const painterDataResult = await resolvePainterData();
      if (!painterDataResult) return;

      const { data: painterData, user } = painterDataResult;
      const userImagesQuery = collection(
        firestore,
        'userImages'
      );
      const userImagesSnapshot = await getDocs(
        userImagesQuery
      );
      const resolveJob = async (jobData: TJob) => {
        if (jobData.address) {
          let { lat, lng } = jobData;

          if (!isDefined(lat) || !isDefined(lng)) {
            const geocodedLocation =
              await handleGeocodeAddress(jobData.address);
            if (geocodedLocation) {
              lat = geocodedLocation.lat;
              lng = geocodedLocation.lng;
            }
          }

          if (isDefined(lat) && isDefined(lng)) {
            const painterCoords =
              await handleGeocodeAddress(
                painterData.address
              );
            if (painterCoords === null) {
              console.error(
                'Job address is missing latitude and/or lnggitude after geocoding:',
                jobData.address,
                ', jobData ',
                jobData
              );
              return null;
            } else {
              const isWithinRange =
                await handleWithinRangeCheck(
                  painterCoords,
                  { lat, lng },
                  painterData.range
                );
              if (isWithinRange) {
                if (jobData.paintPreferencesId) {
                  const paintPrefDocRef = doc(
                    firestore,
                    'paintPreferences',
                    jobData.paintPreferencesId
                  );
                  const paintPrefDocSnap = await getDoc(
                    paintPrefDocRef
                  );
                  if (paintPrefDocSnap.exists()) {
                    jobData.paintPreferences =
                      paintPrefDocSnap.data() as TPaintPreferences;
                  }
                }

                const video = await resolveVideoUrl(
                  jobData.video
                );

                return {
                  ...jobData,
                  ...(video ? { video } : { video: '' }),
                };
              }
            }
          } else {
            console.error(
              'usePainter.handleFetchPainterData Job address is missing latitude and/or lnggitude after geocoding:',
              jobData.address,
              ', jobData ',
              jobData
            );
          }
        }
        return null;
      };

      const resolveJobData = async (jobDoc: any) => {
        const jobData = jobDoc.data() as TJob;
        const job = resolveJob(jobData);
        return {
          ...job,
          jobId: jobDoc.id,
        };
      };

      const jobs = await Promise.all(
        userImagesSnapshot.docs.map(resolveJobData)
      );
      const filteredJobs = jobs.filter(isTruthy) as TJob[];
      const unquotedJobs = filteredJobs.filter(
        (job) =>
          !job.prices.some(
            (price) => price.painterId === user.uid
          )
      );
      setJobs(unquotedJobs);
    } catch (error) {
      const errorMessage = 'Error fetching painter data';
      notifyError(errorMessage);
      console.error(error);
    } finally {
      setFetching(false);
    }
  };

  return {
    isFetching,
    jobs,
    onFetch: handler,
  };
};
