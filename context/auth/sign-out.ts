import { getAuth, signOut } from 'firebase/auth';
import firebase from '@/lib/firebase';
import { useCallback } from 'react';
import { TAuthSignOutConfig } from '@/context/auth/types';
import { useApp } from '@/context/app/provider';

type TConfig = TAuthSignOutConfig;
export const useSignOut = ({
  dispatchUserSignedIn,
  dispatchProfilePictureUrl,
}: TConfig) => {
  const { onNavigateScrollTopClick } = useApp();
  const auth = getAuth(firebase);

  const handler = useCallback(async () => {
    try {
      await signOut(auth);
      console.log('Sign out successful and nav home');
    } catch (error) {
      console.error('Error signing out: ', error);
    } finally {
      onNavigateScrollTopClick('/');
      dispatchUserSignedIn(false);
      dispatchProfilePictureUrl(null);
      sessionStorage.clear();
    }
  }, [auth]);

  return handler;
};
