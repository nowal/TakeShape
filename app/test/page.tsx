import { ComponentsCongrats } from '@/components/congrats';
import { FallbacksLoading } from '@/components/fallbacks/loading';
import { FC, Suspense } from 'react';

const AppTestWithSuspense: FC = () => {
  return (
    <Suspense fallback={<FallbacksLoading />}>
      <ComponentsCongrats />
    </Suspense>
  );
};

export default AppTestWithSuspense;
