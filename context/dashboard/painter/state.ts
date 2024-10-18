import { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { TJobType } from '@/components/dashboard/painter/types';
import { useApp } from '@/context/app/provider';

export const usePainterState = () => {
  const { onNavigateScrollTopClick } = useApp();
  const [selectedPage, setSelectedPage] =
    useState<TJobType>('available');
  const [isNavigating, setNavigating] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;

  const handlePageChange = (selected: TJobType) => {
    setNavigating(true);
    setSelectedPage(selected);
    if (selected === 'available') {
      onNavigateScrollTopClick('/dashboard');
    } else if (selected === 'accepted') {
      onNavigateScrollTopClick('/acceptedQuotes');
    } else if (selected === 'completed') {
      onNavigateScrollTopClick('/completedQuotes');
    }
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
