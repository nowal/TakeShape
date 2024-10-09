'use client';
import { AccountMenuIcon } from '@/components/buttons/account-menu/icon';
import { cx } from 'class-variance-authority';
import {
  AccountMenuList,
  TAccountMenuListItem,
} from '@/components/buttons/account-menu/list';
import { ButtonsCvaButton } from '@/components/cva/button';
import { useAuth } from '@/context/auth/provider';
import { useSignInButton } from '@/components/buttons/sign-in-button/hook';

export const AccountMenu = () => {
  const { menu, onNavigateScrollTopClick } = useAuth();
  const {
    isMenuOpen,
    outsideClickRef,
    onMenuOpenToggle,
    onDashboardClick,
  } = menu;
  const signInButtonItem = useSignInButton();
  const dashboardItem: TAccountMenuListItem = [
    'Dashboard',
    onDashboardClick,
  ];
  const manageAccountItem: TAccountMenuListItem = [
    'Manage Account',
    () => onNavigateScrollTopClick('/accountSettings'),
  ];
  const items = [
    dashboardItem,
    manageAccountItem,
    signInButtonItem,
  ] satisfies TAccountMenuListItem[];

  return (
    <div ref={outsideClickRef}>
      <ButtonsCvaButton
        title="Title Open"
        onTap={onMenuOpenToggle}
        classValue={cx('bg-white', 'shadow-md', 'z-10')}
        rounded="full"
        size="iconXl"
        intent="icon"
        center
      >
        <AccountMenuIcon />
      </ButtonsCvaButton>
      {isMenuOpen && <AccountMenuList items={items} />}
    </div>
  );
};
