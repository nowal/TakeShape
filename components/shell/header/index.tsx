'use client';
import Link from 'next/link';
import { cx } from 'class-variance-authority';
import { ShellLogo } from '@/components/shell/logo';
import { HeaderOptions } from '@/components/shell/header/options';

export const ShellHeader = () => {
  return (
    <header
      className={cx(
        'sticky max-w-shell w-full',
        'top-0 inset-x-0 pt-3.5 px-6 z-20 lg:px-9',
        'z-10'
      )}
    >
      <div
        className={cx(
          'relative',
          'flex items-center justify-between w-full',
          'pl-4.5 pr-2.5 py-2.5 lg:pl-7 lg:pr-2 lg:py-3'
        )}
      >
        <Link className='relative z-10' href="/">
          <ShellLogo />
        </Link>
        <HeaderOptions />
      </div>
    </header>
  );
};
