import { TCommonIconProps } from '@/components/icon';
import { IconsLoading16 } from '@/components/icons/loading/16';
import type { FC } from 'react';

type TProps = TCommonIconProps;
export const IconsLoading16White: FC<TProps> = ({
  ...props
}) => {
  return (
    <IconsLoading16 classColor="stroke-white" {...props} />
  );
};
