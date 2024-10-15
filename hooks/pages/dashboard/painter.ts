import { useState, useEffect } from 'react';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { TJob, TPaintPreferences } from '@/types'; // Ensure this path is correct
import { notifyError } from '@/utils/notifications';
import { resolveVideoUrl } from '@/context/dashboard/painter/video-url';
import { isDefined } from '@/utils/validation/is/defined';
import { usePainter } from '@/context/dashboard/painter/provider';

export const useDashboardPainter = () => {
  const { onGeocodeAddress, onJobWithinRangeCheck } =
    usePainter();
  const [jobList, setJobList] = useState<TJob[]>([]);
  const firestore = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  const handleFetchPainterData = async () => {
    try {
      if (user) {
        const painterQuery = query(
          collection(firestore, 'painters'),
          where('userId', '==', user.uid)
        );
        const painterSnapshot = await getDocs(painterQuery);
        if (!painterSnapshot.empty) {
          const painterData =
            painterSnapshot.docs[0].data();

          console.log('Painter Data:', painterData);

          const userImagesQuery = collection(
            firestore,
            'userImages'
          );
          const userImagesSnapshot = await getDocs(
            userImagesQuery
          );
          const jobs = await Promise.all(
            userImagesSnapshot.docs.map(async (jobDoc) => {
              const jobData = jobDoc.data() as TJob;

              if (jobData.address) {
                let { lat, lng } = jobData;

                if (!isDefined(lat) || !isDefined(lng)) {
                  const geocodedLocation =
                    await onGeocodeAddress(jobData.address);
                  if (geocodedLocation) {
                    lat = geocodedLocation.lat;
                    lng = geocodedLocation.lng;
                  }
                }

                if (isDefined(lat) && isDefined(lng)) {
                  const isWithinRange =
                    await onJobWithinRangeCheck(
                      painterData.address,
                      painterData.range,
                      { lat, lng }
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
                      ...(video
                        ? { video }
                        : { video: '' }),
                      jobId: jobDoc.id,
                    };
                  }
                } else {
                  console.error(
                    'useDashboardPainter.handleFetchPainterData Job address is missing latitude and/or lnggitude after geocoding:',
                    jobData.address,
                    ', jobData ',
                    jobData
                  );
                }
              }
              return null;
            })
          );
          const filteredJobs = jobs.filter(
            (job) => job !== null
          ) as TJob[];
          const unquotedJobs = filteredJobs.filter(
            (job) =>
              !job.prices.some(
                (price) => price.painterId === user.uid
              )
          );
          setJobList(unquotedJobs);
        }
      } else {
        console.log(
          'No user found, unable to fetch painter data.'
        );
      }
    } catch (error) {
      const errorMessage = 'Error fetching painter data';
      notifyError(errorMessage);
      console.error(error);
    }
  };

  useEffect(() => {
    handleFetchPainterData();
  }, [user, firestore]);

  return {
    jobs: jobList,
    dispatchJobList: setJobList,
    onFetchPainterData: handleFetchPainterData,
  };
};
