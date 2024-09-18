import type { FC } from 'react';
import {
  ButtonsCvaButton,
  TButtonsCvaButtonProps,
} from '@/components/cva/button';
import { IconsHamburger } from '@/components/icons/hamburger';

type TProps = Partial<TButtonsCvaButtonProps>;
export const ShellHeaderMobileButton: FC<TProps> = (props) => {
  return (
    <ButtonsCvaButton
      title="Menu"
      size="fill"
      center={true}
      {...props}
    >
      <IconsHamburger />
    </ButtonsCvaButton>
  );
};
