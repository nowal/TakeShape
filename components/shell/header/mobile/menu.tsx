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

  useEffect(() => {
    if (viewport.isResizing) {
      setMenuOpen(false);
    }
  }, [viewport.isResizing]);

  return (
    <div className="relative flex items-center justify-center size-12 text-pink shrink-0 shadow-09 rounded-md lg:hidden">
      <ButtonsCvaButton
        title="Menu"
        size="fill"
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        <IconsHamburger />
      </ButtonsCvaButton>
      {isMenuOpen && (
        <>
          {createPortal(
            <Modal onTap={() => setMenuOpen(false)}>
              <div
                className={cx(
                  'relative flex flex-col items-center py-9 px-6 bg-white rounded-2xl',
                  'gap-2.5',
                  // 'w-[23.875rem]',
                  'shadow-08'
                )}
              >
                <HeaderOptions />
              </div>
            </Modal>,
            document.body
          )}
        </>
      )}
    </div>
  );
};
