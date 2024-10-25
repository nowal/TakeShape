import { CvaIcon } from '@/components/cva/icon';
import { TDivMotionProps } from '@/types/dom';
import type { FC, PropsWithChildren } from 'react';

export const CvaIconLeading: FC<
  PropsWithChildren<TDivMotionProps>
> = ({ children, ...props }) => {
  return <CvaIcon {...props}>{children}</CvaIcon>;
};
