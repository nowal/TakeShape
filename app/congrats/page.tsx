'use client';
import { FallbacksLoading } from '@/components/fallbacks/loading';
import { FC, Suspense } from 'react';
import { ComponentsCongrats } from '@/components/congrats';
import { useAuthNavigateHome } from '@/hooks/auth/navigate/home';

const CongratsWithSuspense: FC = () => {
  useAuthNavigateHome();

  return (
    <Suspense fallback={<FallbacksLoading />}>
      <ComponentsCongrats />
    </Suspense>
  );
};

export default CongratsWithSuspense;
