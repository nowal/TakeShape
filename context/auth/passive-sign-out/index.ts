import { useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { TAuthConfig } from '@/context/auth/types';
import { useTimeoutRef } from '@/hooks/timeout-ref';
import { useEventListener } from '@/hooks/event-listener';

export const usePassiveSignOut = ({
isUserSignedIn,
  dispatchUserSignedIn,
  onSignOut,
}: TAuthConfig) => {
  const auth = getAuth();
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

  useEventListener(isUserSignedIn ? 'mousemove' : null,  handleReset);
  useEventListener(isUserSignedIn ? 'keydown' : null, handleReset);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      dispatchUserSignedIn(Boolean(user));
    });
    return unsubscribe;
  }, [auth]);
};
