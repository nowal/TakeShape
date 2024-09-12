'use client';
import { useEffect, useState } from 'react';
import { IconsHamburger } from '@/components/icons/hamburger';
import { ButtonsCvaButton } from '@/components/cva/button';
import { createPortal } from 'react-dom';
import { Modal } from '@/components/modal';
import { HeaderOptions } from '@/components/shell/header/options';
import { cx } from 'class-variance-authority';
import { useViewport } from '@/context/viewport';

export const ShellHeaderMobileMenu = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);

  const viewport = useViewport();

  const handleClose = () => setMenuOpen(false);
  useEffect(() => {
    if (viewport.isResizing) {
      handleClose();
    }
  }, [viewport.isResizing]);

  return (
    <div className="relative flex items-center justify-center size-12 text-pink shrink-0 shadow-09 rounded-md lg:hidden">
      <ButtonsCvaButton
        title="Menu"
        size="fill"
        layout={false}
        center={true}
        onTap={() => setMenuOpen((prev) => !prev)}
      >
        <IconsHamburger />
      </ButtonsCvaButton>
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
                <HeaderOptions onClose={handleClose} />
              </div>
            </Modal>,
            document.body
          )}
        </>
      )}
    </div>
  );
};
