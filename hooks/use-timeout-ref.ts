import { useEffect, useRef } from 'react';

type TTimeoutReturn = ReturnType<typeof setTimeout>;

export const useTimeoutRef = () => {
  const timeoutRef = useRef<TTimeoutReturn | number | null>(
    null,
  );

  const endTimeout = () => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => endTimeout, []);

  return { timeoutRef, endTimeout };
};
