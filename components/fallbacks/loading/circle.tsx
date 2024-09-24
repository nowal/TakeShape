import { IconsLoading } from '@/components/icons/loading';
import type { FC } from 'react';

export const FallbacksLoadingCircle: FC = () => {
  return (
    <div className="flex flex-row items-center gap-2 text-inherit">
      <IconsLoading />
      Loading...
    </div>
  );
};
