import { useRef, useState } from 'react';
import { getFirestore } from 'firebase/firestore';
import { TJobs } from '@/types/jobs';

export const usePainterJobsState = () => {
  const isInitRef = useRef<boolean>(false);
  const [isFetching, setFetching] =
    useState<boolean>(false);
  const [jobs, setJobs] = useState<TJobs>([]);
  const [count, setCount] = useState<number>(10);
  const firestore = getFirestore();

  return {
    firestore,
    isFetching,
    jobs,
    count,
    isInitRef,
    dispatchJobs: setJobs,
    dispatchFetching: setFetching,
    dispatchCount: setCount,
  };
};

export type TPainterJobsState = ReturnType<
  typeof usePainterJobsState
>;
