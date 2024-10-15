import { useTimebomb } from '@/hooks/time-bomb';
import { useState } from 'react';

export const useQuoteFakeHandler = () => {
  const [isCompleted, setCompleted] = useState(false);

  const handleSuccess = () => setCompleted(true);

  const { trigger, isArmed: isInit } = useTimebomb(
    500,
    handleSuccess
  );

  const handleInit = () => {
    setCompleted(false);
    trigger();
  };

  return {
    onInit: handleInit,
    isCompleted,
    isInit,
  };
};
