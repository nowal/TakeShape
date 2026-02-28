'use client';
import { AccountMenuIcon } from '@/components/buttons/account-menu/icon';
import { cx } from 'class-variance-authority';
import {
  AccountMenuList,
  TAccountMenuListItem,
} from '@/components/buttons/account-menu/list';
import { CvaButton } from '@/components/cva/button';
import { useAuth } from '@/context/auth/provider';
import { useSignInButton } from '@/components/buttons/sign-in-button/hook';
import { useApp } from '@/context/app/provider';

export const AccountMenu = () => {
  const { onNavigateScrollTopClick } = useApp();
  const { menu } = useAuth();
  const {
    isMenuOpen,
    isAgent,
    isPainter,
    outsideClickRef,
    onMenuOpenToggle,
    onDashboardClick,
  } = menu;
  const signInButtonItem = useSignInButton();
  const dashboardItem: TAccountMenuListItem = [
    isAgent ? 'Dashboard' : 'Quotes',
    onDashboardClick,
  ];
  const manageAccountItem: TAccountMenuListItem = [
    'Manage Account',
    () => onNavigateScrollTopClick('/accountSettings'),
  ];
  const callItem: TAccountMenuListItem = [
    'Call',
    () => onNavigateScrollTopClick('/call'),
  ];
  const items = [
    dashboardItem,
    ...(isPainter && !isAgent ? [callItem] : []),
    manageAccountItem,
    signInButtonItem,
  ] satisfies TAccountMenuListItem[];

  return (
    <div ref={outsideClickRef}>
      <CvaButton
        title="Title Open"
        onTap={onMenuOpenToggle}
        classValue={cx('bg-white', 'shadow-md', 'z-10')}
        rounded="full"
        size="iconXl"
        intent="icon"
        center
      >
        <AccountMenuIcon />
      </CvaButton>
      {isMenuOpen && <AccountMenuList items={items} />}
    </div>
  );
};
