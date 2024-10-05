import { FallbacksLoading } from '@/components/fallbacks/loading';
import { IconsLoading } from '@/components/icons/loading';
import { TDivProps } from '@/types/dom';
import type { FC } from 'react';

type TProps = TDivProps;
export const FallbacksLoadingCircle: FC<TProps> = ({
  children,
  ...props
}) => {
  return (
    <FallbacksLoading IconFc={IconsLoading} {...props}>
      {children}
    </FallbacksLoading>
  );
};
