'use client';
import { FallbacksLoading } from '@/components/fallbacks/loading';
import { FC, Suspense } from 'react';
import { ComponentsOops } from '@/components/oops';

const OopsWithSuspense: FC = () => {
  return (
    <Suspense fallback={<FallbacksLoading />}>
      <ComponentsOops />
    </Suspense>
  );
};

export default OopsWithSuspense;
