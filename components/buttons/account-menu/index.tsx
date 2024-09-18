'use client';
import { AccountMenuIcon } from '@/components/buttons/account-menu/icon';
import { cx } from 'class-variance-authority';
import {
  AccountMenuList,
  TAccountMenuListItem,
} from '@/components/buttons/account-menu/list';
import { ButtonsCvaButton } from '@/components/cva/button';
import { useAuth } from '@/context/auth/provider';

export const AccountMenu = () => {
  const { menu } = useAuth();
  const {
    isDropdownOpen,
    isLoading,
    profilePictureUrl,
    outsideClickRef,
    onDropdownOpenToggle,
    onDashboardClick,
    onMenuClick,
    onSignOut,
  } = menu;

  const items = [
    ['Dashboard', onDashboardClick],
    [
      'Manage Account',
      () => onMenuClick('/accountSettings'),
    ],
    ['Sign Out', onSignOut],
  ] as const satisfies TAccountMenuListItem[];

  return (
    <div ref={outsideClickRef}>
      <ButtonsCvaButton
        title="Title Open"
        onTap={onDropdownOpenToggle}
        classValue={cx('bg-white', 'shadow-md', 'z-10')}
        rounded="full"
        size="iconXl"
        intent="icon"
        center
      >
        <AccountMenuIcon
          isDropdownOpen={isDropdownOpen}
          isLoading={isLoading}
          profilePictureUrl={profilePictureUrl}
        />
      </ButtonsCvaButton>
      {isDropdownOpen && <AccountMenuList items={items} />}
    </div>
  );
};
