import type { FC } from 'react';
import { TPropsWithChildren } from '@/types/dom/main';
import { InViewReplacersCustom } from '@/components/in-view';
import { FallbacksBasic } from '@/components/fallbacks/loading/basic';

export const ReplacersBasic: FC<TPropsWithChildren> = ({
  children,
}) => {
  return (
    <InViewReplacersCustom
      classValue="relative"
      Space={FallbacksBasic}
    >
      <> {children}</>
    </InViewReplacersCustom>
  );
};
