'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Modal } from '@/components/modal';
import { useViewport } from '@/context/viewport';
import { ShellHeaderMobileButton } from '@/components/shell/header/mobile/button';
import {
  AccountMenuList,
  TAccountMenuListItem,
} from '@/components/buttons/account-menu/list';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth/provider';

export const ShellHeaderMobileMenu = () => {
  const { signOut, isUserSignedIn, menu } = useAuth();
  const { onMenuClick, onDashboardClick } = menu;
  const title = isUserSignedIn ? 'Sign Out' : 'Login';

  const [isMenuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const viewport = useViewport();
  const handleClose = () => setMenuOpen(false);

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
  ] as const satisfies TAccountMenuListItem[];

  const quoteItems = [
    ['Quote', () => router.push('/quote')],
  ] as const satisfies TAccountMenuListItem[];

  const items = [
    ...(isUserSignedIn ? dashboardItems : quoteItems),
    [title, signOut.onSignOut],
  ] as const satisfies TAccountMenuListItem[];

  return (
    <div className="relative flex items-center justify-center size-12 text-pink shrink-0 shadow-09 rounded-md lg:hidden">
      <ShellHeaderMobileButton
        onTap={() => setMenuOpen((prev) => !prev)}
      />
      {isMenuOpen && (
        <>
          {createPortal(
            <Modal onTap={handleClose}>
              {/* <div
                className={cx(
                  'relative',
                  'inset-0',
                  'w-full',
                  'bg-red',
                  'flex items-center justify-center'
                  // 'left-1/2',
                  // 'translate-x-1/2'
                  // 'relative flex flex-col items-center py-9 px-6 bg-white rounded-2xl',
                  // 'gap-2.5',
                  // 'shadow-08'
                )}
              > */}
              <AccountMenuList
                classPosition="relative"
                items={items}
              />
              {/* </div> */}
            </Modal>,
            document.body
          )}
        </>
      )}
    </div>
  );
};
