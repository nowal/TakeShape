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
  const { menu, signIn, isUserSignedIn } = useAuth();
  const {
    isMenuOpen,
    isLoading,
    profilePictureUrl,
    outsideClickRef,
    onMenuOpenToggle,
    onDashboardClick,
    onMenuClick,
  } = menu;
  const signInButtonItem = useSignInButton();

  const items = [
    ['Dashboard', onDashboardClick],
    [
      'Manage Account',
      () => onMenuClick('/accountSettings'),
    ],
    signInButtonItem,
  ] as const satisfies readonly TAccountMenuListItem[];

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
        <AccountMenuIcon
          isMenuOpen={isMenuOpen}
          isLoading={isLoading}
          profilePictureUrl={profilePictureUrl}
        />
      </ButtonsCvaButton>
      {isMenuOpen && <AccountMenuList items={items} />}
    </div>
  );
};
