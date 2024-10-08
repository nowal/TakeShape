import type { FC } from 'react';
import { TPropsWithChildren } from '@/types/dom/main';
import { FallbacksFill } from '@/components/fallbacks/loading/fill';
import { InViewReplacersCustom } from '@/components/in-view';

export const ReplacersFill: FC<TPropsWithChildren> = ({
  children,
}) => {
  return (
    <InViewReplacersCustom
      classValue="absolute inset-0"
      Space={FallbacksFill}
    >
      <> {children}</>
    </InViewReplacersCustom>
  );
};
