import { TCommonIconProps } from '@/components/icon';
import { IconsError16 } from '@/components/icons/error/16';
import type { FC } from 'react';

type TProps = TCommonIconProps;
export const IconsError16White: FC<TProps> = ({
  ...props
}) => {
  return (
    <IconsError16 classColor="stroke-white" {...props} />
  );
};
