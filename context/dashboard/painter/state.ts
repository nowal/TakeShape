import { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { TJobType } from '@/components/dashboard/painter/types';
import { useApp } from '@/context/app/provider';
import { JOB_TYPE_TO_PAGE_ROUTE } from '@/components/dashboard/painter/constants';

export const usePainterState = () => {
  const { onNavigateScrollTopClick } = useApp();
  const [selectedPage, setSelectedPage] =
    useState<TJobType>('available');
  const [isNavigating, setNavigating] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;

  const handlePageChange = (jobType: TJobType) => {
    setNavigating(true);
    setSelectedPage(jobType);
    onNavigateScrollTopClick(
      JOB_TYPE_TO_PAGE_ROUTE[jobType]
    );
  };

  const handleNavigatingDone = () => setNavigating(false);

  return {
    isNavigating,
    selectedPage,
    user,
    onNavigatingDone: handleNavigatingDone,
    onPageChange: handlePageChange,
  };
};
