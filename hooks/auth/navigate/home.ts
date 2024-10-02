import { useEffect } from 'react';
import { useAuth } from '@/context/auth/provider';

export const useAuthNavigateHome = () => {
  const {
    isUserSignedIn,
    signIn: { isAuthLoading },
    onNavigateScrollTopClick,
  } = useAuth();

  useEffect(() => {
    if (!isAuthLoading && !isUserSignedIn) {
      onNavigateScrollTopClick('/');
    }
  }, [isUserSignedIn, isAuthLoading]);
};
