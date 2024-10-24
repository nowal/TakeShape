import { FallbacksLoadingFill } from '@/components/fallbacks/loading';
import { IconsLoading } from '@/components/icons/loading';
import { TDivProps } from '@/types/dom';
import type { FC } from 'react';

type TProps = TDivProps;
export const FallbacksLoadingCircle: FC<TProps> = ({
  children,
  ...props
}) => {
  return (
    <FallbacksLoadingFill IconFc={IconsLoading} {...props}>
      {children}
    </FallbacksLoadingFill>
  );
};
