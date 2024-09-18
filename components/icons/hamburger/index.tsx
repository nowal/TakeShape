import {
  CommonIcon,
  TCommonIconProps,
} from '@/components/icon';
import type { FC } from 'react';

type TProps = TCommonIconProps;
export const IconsHamburger: FC<TProps> = ({
  ...props
}) => {
  return (
    <CommonIcon
      width="1em"
      height="1em"
      classValue="size-9 shrink-0"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      d="M5 8h22M5 16h22M5 24h22"
      {...props}
    />
  );
};
