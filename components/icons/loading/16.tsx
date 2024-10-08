import { TCommonIconProps } from '@/components/icon';
import { IconsLoading } from '@/components/icons/loading';
import type { FC } from 'react';

type TProps = TCommonIconProps;
export const IconsLoading16: FC<TProps> = ({
  ...props
}) => {
  return (
    <IconsLoading
      size={16}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    />
  );
};
