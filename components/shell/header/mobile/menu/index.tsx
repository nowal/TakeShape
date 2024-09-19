'use client';
import { useEffect } from 'react';
import { ComponentsModal } from '@/components/modal';
import { useViewport } from '@/context/viewport';
import { ShellHeaderMobileButton } from '@/components/shell/header/mobile/button';
import {
  AccountMenuList,
  TAccountMenuListItem,
} from '@/components/buttons/account-menu/list';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth/provider';
import { useSignInButton } from '@/components/buttons/sign-in-button/hook';
import { MobileMenuModal } from '@/components/shell/header/mobile/menu/modal';

export const ShellHeaderMobileMenu = () => {
  const { isUserSignedIn, menu } = useAuth();
  const {
    onMenuClick,
    onDashboardClick,
    isMenuOpen,
    dispatchMenuOpen,
  } = menu;
  const [title, handler] = useSignInButton();
  const pathname = usePathname();

  const router = useRouter();
  const viewport = useViewport();
  const handleClose = () => dispatchMenuOpen(false);

  useEffect(() => {
    if (viewport.isResizing) {
      handleClose();
    }
  }, [viewport.isResizing]);

  const dashboardItems = [
    ['Dashboard', onDashboardClick],
    [
      'Manage Account',
      () => onMenuClick('/accountSettings'),
    ],
  ] satisfies TAccountMenuListItem[];

  const quoteItems = [
    ['Quote', () => router.push('/quote')],
  ] satisfies TAccountMenuListItem[];

  const items = [
    ...(isUserSignedIn
      ? dashboardItems
      : pathname === '/quote'
      ? []
      : quoteItems),
    [title, handler],
  ] satisfies TAccountMenuListItem[];

  return (
    <>
      {isMenuOpen && (
        <MobileMenuModal onTap={handleClose}>
          <AccountMenuList
            classPosition="relative"
            items={items}
          />
        </MobileMenuModal>
      )}
      <div className="relative flex items-center justify-center size-12 text-pink shrink-0 shadow-09 rounded-md sm:hidden">
        <ShellHeaderMobileButton />
      </div>
    </>
  );
};
