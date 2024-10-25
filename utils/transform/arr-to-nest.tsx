import { FallbacksLogoFill } from '@/components/fallbacks/logo/fill';
import { TChildren } from '@/types/dom';
import { FC, PropsWithChildren, Suspense } from 'react';

export const arrToNest = <
  P extends PropsWithChildren = PropsWithChildren
>(
  arr: FC<P>[],
  init: TChildren,
  props: P
) => {
  return arr.reduce((a: TChildren, C: FC<P>) => {
    const next = (
      <Suspense fallback={<FallbacksLogoFill />}>
        <C {...props}>{a}</C>
      </Suspense>
    );
    return next;
  }, init);
};
