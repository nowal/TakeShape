import { useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { TAuthConfig } from '@/context/auth/types';
import { useTimeoutRef } from '@/hooks/timeout-ref';
import { useEventListener } from '@/hooks/event-listener';
import firebase from '@/lib/firebase';

export const usePassiveSignOut = ({
isUserSignedIn,
  dispatchUserSignedIn,
  onSignOut,
}: TAuthConfig) => {
  const auth = getAuth(firebase);
  const TIMEOUT_DURATION = 1800 * 1000;
  const { timeoutRef, endTimeout } = useTimeoutRef();

  const handleSignout = () => {
    timeoutRef.current = setTimeout(
      onSignOut,
      TIMEOUT_DURATION
    );
  };

  const handleReset = () => {
    endTimeout();
    handleSignout();
  };

  useEventListener(isUserSignedIn ? 'mousemove' : null, handleReset);
  useEventListener(isUserSignedIn ? 'keydown' : null, handleReset);
  useEventListener(isUserSignedIn ? 'click' : null, handleReset);
  useEventListener(isUserSignedIn ? 'touchstart' : null, handleReset);
  useEventListener(isUserSignedIn ? 'pointerdown' : null, handleReset);
  useEventListener(isUserSignedIn ? 'focus' : null, handleReset);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        dispatchUserSignedIn(Boolean(user));
      },
      (error) => {
        console.error('Passive auth listener failed:', error);
        dispatchUserSignedIn(false);
      }
    );
    return unsubscribe;
  }, [auth, dispatchUserSignedIn]);
};
