import { useEffect, useCallback } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import { TAuthConfig } from '@/context/auth/types';
import { isProfilePicAtom } from '@/atom';
import { useAtom } from 'jotai';

export const usePassiveSignOut = ({
  dispatchUserSignedIn,
}: TAuthConfig) => {
  const auth = getAuth();
  const TIMEOUT_DURATION = 1800 * 1000;
  const [profilePictureSrc, setProfilePictureUrl] = useAtom(
    isProfilePicAtom
  );
  const handleSignOut = useCallback(() => {
    signOut(auth)
      .then(() => {
        console.log('User signed out due to inactivity.');
      })
      .catch((error) => {
        console.error('Error signing out: ', error);
      })
      .finally(() => {
        setProfilePictureUrl(null);
      });
  }, [auth]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      dispatchUserSignedIn(Boolean(user));
    });

    let signOutTimer = setTimeout(
      handleSignOut,
      TIMEOUT_DURATION
    );

    const resetTimer = () => {
      clearTimeout(signOutTimer);
      signOutTimer = setTimeout(
        handleSignOut,
        TIMEOUT_DURATION
      );
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);

    return () => {
      unsubscribe();
      clearTimeout(signOutTimer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, [auth, handleSignOut]);
};
