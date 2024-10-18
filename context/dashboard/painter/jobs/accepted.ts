import { useState } from 'react';
import {
  getFirestore,
  getDoc,
  doc,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { resolveVideoUrl } from '@/utils/video/url';
import { resolvePainterData } from '@/context/dashboard/painter/jobs/utils/painter-data';
import { isTruthy } from '@/utils/validation/is/truthy';
import { TJob } from '@/types/jobs';
import { TPaintPreferences } from '@/types/preferences';

export const usePainterJobsAccepted = () => {
  const [isFetching, setFetching] =
    useState<boolean>(false);
  const [jobs, setJobs] = useState<TJob[]>([]);
  const firestore = getFirestore();

  const handler = async () => {
    try {
      setFetching(true);
      const painterDataResult = await resolvePainterData();
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
          let jobData = {} as TJob;

          const fetchPaintPreferences = async (
            jobSnapshot: QueryDocumentSnapshot<
              DocumentData,
              DocumentData
            >
          ) => {
            const jobData = jobSnapshot.data() as TJob;

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

            return jobData;
          };

          const fetchPaintPreferencesResult =
            await fetchPaintPreferences(jobSnapshot);

          jobData = {
            ...(fetchPaintPreferencesResult ?? {}),
          };

          const fetchUserInfo = async () => {
            if (jobData.userId) {
              const userDocRef = doc(
                firestore,
                'users',
                jobData.userId
              );
              const userDocSnap = await getDoc(userDocRef);
              if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                jobData.customerName = userData.name;
                jobData.phoneNumber =
                  jobData.phoneNumber ||
                  userData.phoneNumber;
                jobData.address =
                  jobData.address || userData.address;
              }

              return jobData;
            }
          };

          const fetchUserInfoResult = await fetchUserInfo();

          jobData = {
            ...(fetchUserInfoResult ?? {}),
            ...jobData,
          };

          jobData.video =
            (await resolveVideoUrl(jobData.video)) ?? '';

          return {
            ...jobData,
            jobId: jobSnapshot.id,
          };
        }
        return;
      };

      const acceptedJobs = await Promise.all(
        painterData.acceptedQuotes.map(resolveJob)
      );

      const nextJobs = acceptedJobs.filter(isTruthy);
      console.log(nextJobs);

      setJobs(nextJobs);
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
