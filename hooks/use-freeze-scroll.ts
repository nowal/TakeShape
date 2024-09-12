import { useEffect } from 'react';

export const useFreezeScrollBar = (isDisabled = false) => {
  useEffect(() => {
    const setOverflow = (next: 'hidden' | 'unset') => {
      document.documentElement.style.overflow = next;
      document.body.style.overflow = next;
    };

    if (isDisabled) {
      setOverflow('unset');
    } else {
      setOverflow('hidden');
    }
    return () => {
      setOverflow('unset');
    };
  }, [isDisabled]);
};
