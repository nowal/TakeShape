import {
  CommonIcon,
  TCommonIconProps,
} from '@/components/icon';
import type { FC } from 'react';

type TProps = TCommonIconProps;
export const IconsError: FC<TProps> = ({ ...props }) => {
  return (
    <CommonIcon
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      d="M12 17q.425 0 .713-.288T13 16t-.288-.712T12 15t-.712.288T11 16t.288.713T12 17m-1-4h2V7h-2zm1 9q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22"
      {...props}
    />
  );
};