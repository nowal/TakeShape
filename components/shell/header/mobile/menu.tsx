'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Modal } from '@/components/modal';
import { cx } from 'class-variance-authority';
import { useViewport } from '@/context/viewport';
import { ShellHeaderMobileButton } from '@/components/shell/header/mobile/button';
import { AccountMenuList } from '@/components/buttons/account-menu/list';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth/provider';

export const ShellHeaderMobileMenu = () => {
  const { signOut } = useAuth();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const viewport = useViewport();
  const handleClose = () => setMenuOpen(false);

  useEffect(() => {
    if (viewport.isResizing) {
      handleClose();
    }
  }, [viewport.isResizing]);

  return (
    <div className="relative flex items-center justify-center size-12 text-pink shrink-0 shadow-09 rounded-md lg:hidden">
      <ShellHeaderMobileButton
        onTap={() => setMenuOpen((prev) => !prev)}
      />
      {isMenuOpen && (
        <>
          {createPortal(
            <Modal onTap={handleClose}>
              <div
                className={cx(
                  'relative flex flex-col items-center py-9 px-6 bg-white rounded-2xl',
                  'gap-2.5',
                  'shadow-08'
                )}
              >
                <AccountMenuList
                  items={
                    [
                      [
                        'Quote',
                        () => router.push('/quote'),
                      ],
                      ['Sign Out', signOut.onSignOut],
                    ] as const
                  }
                />
              </div>
            </Modal>,
            document.body
          )}
        </>
      )}
    </div>
  );
};
