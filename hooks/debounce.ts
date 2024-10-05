import { useEffect } from 'react';
import { useTimeoutRef } from '@/hooks/timeout-ref';

export const useDebounce = () => {
  const { timeoutRef, endTimeout } = useTimeoutRef();

  useEffect(() => endTimeout, []);

  const handler = (callback: () => void, ms = 500) => {
    endTimeout();
    timeoutRef.current = setTimeout(callback, ms);
  };

  return handler;
};
