import { useState } from 'react';
import { getFirestore } from 'firebase/firestore';
import { TJobs } from '@/types/jobs';

export const usePainterJobsState = () => {
  const [isFetching, setFetching] =
    useState<boolean>(false);
  const [jobs, setJobs] = useState<TJobs>([]);
  const firestore = getFirestore();

  return {
    firestore,
    isFetching,
    jobs,
    dispatchJobs: setJobs,
    dispatchFetching: setFetching,
  };
};
