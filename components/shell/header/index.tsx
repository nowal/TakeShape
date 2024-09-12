'use client';;
import Link from 'next/link';
import { cx } from 'class-variance-authority';
import { ShellLogo } from '@/components/shell/logo';
import { HeaderOptions } from '@/components/shell/header/options';
import { ShellHeaderMobileMenu } from '@/components/shell/header/mobile/menu';

export const ShellHeader = () => {
  return (
    <header
      className={cx(
        'sticky max-w-shell w-full',
        'top-0 inset-x-0 pt-3.5 px-6 z-20 lg:px-9'
      )}
    >
      <div
        className={cx(
          'flex items-center justify-between w-full',
          'bg-white',
          'rounded-[0.70013rem] lg:rounded-15.1875',
          'pl-4.5 pr-2.5 py-2.5 lg:pl-7 lg:pr-2 lg:py-3',
          'shadow-09 lg:shadow-08'
        )}
      >
        <Link href="/">
          <ShellLogo />
        </Link>
        <div className="hidden items-center px-4 gap-2.5 sm:px-2 lg:flex">
          <HeaderOptions />
        </div>
        <ShellHeaderMobileMenu />
      </div>
    </header>
  );
};
