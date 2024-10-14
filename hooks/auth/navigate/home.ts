import { useEffect } from 'react';
import { useAuth } from '@/context/auth/provider';
import { useApp } from '@/context/app/provider';

export const useAuthNavigateHome = () => {
  const { onNavigateScrollTopClick } = useApp();
  const {
    isAuthLoading,
    isUserSignedIn,
  } = useAuth();

  useEffect(() => {
    console.log("NAV HOME loading: ",isAuthLoading, " signed in ", isUserSignedIn )

    if (!isAuthLoading && !isUserSignedIn) {
      console.log("NAV HOME" )

      onNavigateScrollTopClick('/');
    }
  }, [isUserSignedIn, isAuthLoading]);
};
