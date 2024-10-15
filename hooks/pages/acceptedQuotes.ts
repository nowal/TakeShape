'use client';
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
import { getAuth } from 'firebase/auth';
import { TJob, TPaintPreferences } from '@/types'; // Adjust the import path as needed
import { usePainter } from '@/context/dashboard/painter/provider';
import { useAuth } from '@/context/auth/provider';
import { resolveVideoUrl } from '@/context/dashboard/painter/video-url';

export const useDashboardPainterAccepted = () => {
  const dashboardPainter = usePainter();
  const { dispatchNavigating } =
    dashboardPainter;
  const [jobList, setJobList] = useState<TJob[]>([]);
  const { isAuthLoading } = useAuth();
  const firestore = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      fetchPainterData();
    }
  }, [user, firestore]);

  useEffect(() => {
    dispatchNavigating(false);
  }, []);

  const fetchPainterData = async () => {
    if (user) {
      const painterQuery = query(
        collection(firestore, 'painters'),
        where('userId', '==', user.uid)
      );
      const painterSnapshot = await getDocs(painterQuery);

      if (!painterSnapshot.empty) {
        const painterData = painterSnapshot.docs[0].data();

        if (
          painterData.acceptedQuotes &&
          painterData.acceptedQuotes.length > 0
        ) {
          const acceptedJobs = await Promise.all(
            painterData.acceptedQuotes.map(
              async (acceptedQuoteId: string) => {
                if (!acceptedQuoteId) {
                  console.error(
                    'Invalid acceptedQuoteId:',
                    acceptedQuoteId
                  );
                  return null;
                }
                const jobRef = doc(
                  firestore,
                  'userImages',
                  acceptedQuoteId
                );
                const jobSnapshot = await getDoc(jobRef);
                if (jobSnapshot.exists()) {
                  const jobData =
                    jobSnapshot.data() as TJob;

                  // Fetch paint preferences
                  if (jobData.paintPreferencesId) {
                    const paintPrefDocRef = doc(
                      firestore,
                      'paintPreferences',
                      jobData.paintPreferencesId
                    );
                    const paintPrefDocSnap = await getDoc(
                      paintPrefDocRef
                    ); // Corrected variable usage
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
                    jobId: jobSnapshot.id,
                  };
                }
                return null;
              }
            )
          );
          setJobList(
            acceptedJobs.filter((job) => job !== null)
          );
        }
      }
    }
  };

  return {
    ...dashboardPainter,
    jobs: jobList,
    isAuthLoading,
  };
};
