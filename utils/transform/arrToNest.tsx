import { TChildren } from '@/types/dom';
import { FC, PropsWithChildren } from 'react';

export const arrToNest = <
  P extends PropsWithChildren = PropsWithChildren,
>(
  arr: FC<P>[],
  init: TChildren,
  props: P,
) => {
  return arr.reduce(
    (a: TChildren, C: FC<P>) => {
      const next = <C {...props}>{a}</C>;
      return next;
    },
    init,
  );
};
