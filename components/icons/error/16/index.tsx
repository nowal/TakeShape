import { TCommonIconProps } from '@/components/icon';
import { IconsError } from '@/components/icons/error';
import type { FC } from 'react';

type TProps = TCommonIconProps;
export const IconsError16: FC<TProps> = ({
  ...props
}) => {
  return (
    <IconsError
      size={16}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    />
  );
};
