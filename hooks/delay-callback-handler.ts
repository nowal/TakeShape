import { useEffect } from 'react';
import { useTimeoutRef } from './timeout-ref';

export const useDelayCallbackHandler = (
  callback: (...args: any) => void,
  delay: number | null,
) => {
  const { timeoutRef, endTimeout } = useTimeoutRef();

  const trigger = () => {
    endTimeout();
    if (typeof delay !== 'number') {
      return;
    }
    timeoutRef.current = setTimeout(callback, delay);
  };

  useEffect(() => {
    trigger();
  }, []);

  return trigger;
};
