import { useState } from 'react';
import {
  getFirestore,
  collection,
  getDoc,
  getDocs,
  doc,
} from 'firebase/firestore';
import { resolveVideoUrl } from '@/utils/video/url';
import { isDefined } from '@/utils/validation/is/defined';
import { useAddressGeocodeHandler } from '@/hooks/address/geocode';
import { useWithinRangeCheckHandler } from '@/context/dashboard/painter/within-range-check';
import { resolvePainterData } from '@/context/dashboard/painter/jobs/utils/painter-data';
import { isTruthy } from '@/utils/validation/is/truthy';
import { TJob } from '@/types/jobs';
import { TPaintPreferences } from '@/types/preferences';

export const usePainterJobsCompleted = () => {
  const [isFetching, setFetching] =
    useState<boolean>(false);
  const [jobs, setJobs] = useState<TJob[]>([]);
  const firestore = getFirestore();

  const handleAddressGeocode = useAddressGeocodeHandler();
  const handleWithinRangeCheck =
    useWithinRangeCheckHandler();

  const handler = async () => {
    try {
      setFetching(true);
      const painterDataResult = await resolvePainterData();
      if (!painterDataResult) return;
      const { data: painterData } = painterDataResult;
      const userImagesQuery = collection(
        firestore,
        'userImages'
      );
      const userImagesSnapshot = await getDocs(
        userImagesQuery
      );
      const resolveJob = userImagesSnapshot.docs.map(
        async (jobDoc) => {
          const jobData = jobDoc.data() as TJob;

          if (jobData.address) {
            let { lat, lng } = jobData;

            if (!isDefined(lat) || !isDefined(lng)) {
              const geocodedLocation =
                await handleAddressGeocode(jobData.address);
              if (geocodedLocation) {
                lat = geocodedLocation.lat;
                lng = geocodedLocation.lng;
              }
            }

            if (isDefined(lat) && isDefined(lng)) {
              const isWithinRange =
                await handleWithinRangeCheck(
                  painterData.address,
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

                // Fetch user information if userId is defined
                if (jobData.userId) {
                  const userDocRef = doc(
                    firestore,
                    'users',
                    jobData.userId
                  );
                  const userDocSnap = await getDoc(
                    userDocRef
                  );
                  if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    jobData.customerName = userData.name;
                    jobData.phoneNumber =
                      jobData.phoneNumber ||
                      userData.phoneNumber;
                    jobData.address =
                      jobData.address || userData.address;
                  }
                }

                const video = await resolveVideoUrl(
                  jobData.video
                );
                return {
                  ...jobData,
                  ...(video ? { video } : { video: '' }),
                  jobId: jobDoc.id,
                };
              }
            } else {
              console.error(
                'Job address is missing latitude and/or lnggitude after geocoding:',
                jobData.address,
                ', jobData ',
                jobData
              );
            }
          }
          return;
        }
      );
      const jobs: (TJob | undefined)[] = await Promise.all(
        resolveJob
      );
      const filteredJobs = jobs.filter(isTruthy) as TJob[];
      setJobs(filteredJobs);
    } catch (error) {
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
