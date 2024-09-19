import type { FC } from 'react';
import { ButtonsCvaButton } from '@/components/cva/button';
import { IconsHamburger } from '@/components/icons/hamburger';
import { useAuth } from '@/context/auth/provider';
import { IconsCloseEm } from '@/components/icons/close/em';

export const ShellHeaderMobileButton: FC = () => {
  const { menu } = useAuth();
  const { isMenuOpen, onMenuOpenToggle } = menu;
  const Icon = isMenuOpen ? IconsCloseEm : IconsHamburger;
  return (
    <ButtonsCvaButton
      title="Menu"
      size="fill"
      center={true}
      classValue='z-20'
      onTap={onMenuOpenToggle}
    >
      <Icon />
    </ButtonsCvaButton>
  );
};
