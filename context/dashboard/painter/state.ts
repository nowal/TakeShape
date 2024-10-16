import { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { TQuoteKey } from '@/components/dashboard/painter/types';
import { useApp } from '@/context/app/provider';

export const usePainterState = () => {
  const { onNavigateScrollTopClick } = useApp();
  const [selectedPage, setSelectedPage] =
    useState<TQuoteKey>('Available Quotes');
  const [isNavigating, setNavigating] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;

  const handlePageChange = (selected: TQuoteKey) => {
    setNavigating(true);
    setSelectedPage(selected);
    if (selected === 'Available Quotes') {
      onNavigateScrollTopClick('/dashboard');
    } else if (selected === 'Accepted Quotes') {
      onNavigateScrollTopClick('/acceptedQuotes');
    } else if (selected === 'Completed Quotes') {
      onNavigateScrollTopClick('/completedQuotes');
    }
  };

  return {
    isNavigating,
    selectedPage,
    user,
    dispatchNavigating: setNavigating,
    onPageChange: handlePageChange,
  };
};
