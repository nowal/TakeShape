import { ButtonsCvaIcon } from '@/components/cva/icon';
import { TDivMotionProps } from '@/types/dom';
import type { FC, PropsWithChildren } from 'react';

export const ButtonsCvaIconLeading: FC<
  PropsWithChildren<TDivMotionProps>
> = ({ children, ...props }) => {
  return <ButtonsCvaIcon {...props}>{children}</ButtonsCvaIcon>;
};
