import { useState } from 'react';
import { TJobType } from '@/components/dashboard/painter/types';
import { useApp } from '@/context/app/provider';
import { JOB_TYPE_TO_PAGE_ROUTE } from '@/components/dashboard/painter/constants';

export const usePainterState = () => {
  const { onNavigateScrollTopClick } = useApp();
  const [isNavigating, setNavigating] = useState(false);

  const handlePageChange = (jobType: TJobType) => {
    const path = JOB_TYPE_TO_PAGE_ROUTE[jobType];
    onNavigateScrollTopClick(path);
  };

  const handleNavigatingDone = () => setNavigating(false);

  return {
    isNavigating,
    onNavigatingDone: handleNavigatingDone,
    onPageChange: handlePageChange,
  };
};
