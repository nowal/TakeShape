'use client';
import { FallbacksLoadingFill } from '@/components/fallbacks/loading';
import { FC, Suspense } from 'react';
import { ComponentsOops } from '@/components/oops';

const OopsWithSuspense: FC = () => {
  return (
    <Suspense fallback={<FallbacksLoadingFill />}>
      <ComponentsOops />
    </Suspense>
  );
};

export default OopsWithSuspense;
