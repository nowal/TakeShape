import { useEffect, useState } from 'react';
import {
  getFirestore,
  collection,
  query,
  where,
  getDoc,
  getDocs,
  doc,
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { TJob, TPaintPreferences } from '@/types'; // Adjust the import path as needed
import { useDashboardPainter } from '@/context/dashboard/painter/provider';
import { useAuth } from '@/context/auth/provider';
import { resolveVideoUrl } from '@/context/dashboard/painter/video-url';
import { isDefined } from '@/utils/validation/is/defined';

export const useDashboardPainterCompleted = () => {
  const { isAuthLoading, dispatchAuthLoading } = useAuth();
  const dashboardPainter = useDashboardPainter();
  const [jobList, setJobList] = useState<TJob[]>([]);
  const firestore = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      dispatchAuthLoading(false); // Authentication state is confirmed, loading is done
    });

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchPainterData();
    }
  }, [user, firestore]);

  const fetchPainterData = async () => {
    if (user) {
      const painterQuery = query(
        collection(firestore, 'painters'),
        where('userId', '==', user.uid)
      );
      const painterSnapshot = await getDocs(painterQuery);

      if (!painterSnapshot.empty) {
        const painterData = painterSnapshot.docs[0].data();

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
                  await dashboardPainter.onGeocodeAddress(
                    jobData.address
                  );
                if (geocodedLocation) {
                  lat = geocodedLocation.lat;
                  lng = geocodedLocation.lng;
                }
              }

              if (isDefined(lat) && isDefined(lng)) {
                const isWithinRange =
                  await dashboardPainter.isJobWithinRange(
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
                  'Job address is missing latitude and/or longitude after geocoding:',
                  jobData.address
                );
              }
            }
            return null;
          })
        );
        const filteredJobs = jobs.filter(
          (job) => job !== null
        ) as TJob[];
        setJobList(filteredJobs);
      }
    }
  };

  return {
    ...dashboardPainter,
    isAuthLoading,
    jobs: jobList,
  };
};
