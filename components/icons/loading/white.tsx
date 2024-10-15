import { TCommonIconProps } from '@/components/icon';
import { IconsLoading } from '@/components/icons/loading';
import type { FC } from 'react';

type TProps = TCommonIconProps;
export const IconsLoadingWhite: FC<TProps> = ({
  ...props
}) => {
  return (
    <IconsLoading classColor="stroke-white" {...props} />
  );
};
