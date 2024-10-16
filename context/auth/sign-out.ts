import { getAuth, signOut } from 'firebase/auth';
import firebase from '@/lib/firebase';
import { useCallback, useState } from 'react';
import { TAuthSignOutConfig } from '@/context/auth/types';
import { useApp } from '@/context/app/provider';

type TConfig = TAuthSignOutConfig;
export const useSignOut = ({
  dispatchUserSignedIn,
  dispatchProfilePictureUrl,
}: TConfig) => {
  const [isSignOutSubmitting, setSignOutSubmitting] =
    useState(false);
  const { onNavigateScrollTopClick } = useApp();
  const auth = getAuth(firebase);

  const handler = useCallback(async () => {
    try {
      setSignOutSubmitting(true);
      await signOut(auth);
      console.log('Sign out successful and nav home');
    } catch (error) {
      console.error('Error signing out: ', error);
    } finally {
      onNavigateScrollTopClick('/');
      dispatchUserSignedIn(false);
      dispatchProfilePictureUrl(null);
      sessionStorage.clear();
      setSignOutSubmitting(false);
    }
  }, [auth]);

  return {
    onSignOut: handler,
    isSignOutSubmitting,
  };
};
