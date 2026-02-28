'use client';
import { useEffect } from 'react';
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
import { useApp } from '@/context/app/provider';

export const ShellHeaderMobileMenu = () => {
  const {onNavigateScrollTopClick} = useApp()
  const { isUserSignedIn, menu } = useAuth();
  const {
    onDashboardClick,
    isMenuOpen,
    isAgent,
    isPainter,
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
    [isAgent ? 'Dashboard' : 'Quotes', onDashboardClick],
    ...(isPainter && !isAgent
      ? [
          [
            'Call',
            () => onNavigateScrollTopClick('/call'),
          ] satisfies TAccountMenuListItem,
        ]
      : []),
    [
      'Manage Account',
      () => onNavigateScrollTopClick('/accountSettings'),
    ],
  ] satisfies TAccountMenuListItem[];

  const quoteItems = [
    ['Quote', () => onNavigateScrollTopClick('/quote')],
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
