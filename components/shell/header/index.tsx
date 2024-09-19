'use client';
import Link from 'next/link';
import { cx } from 'class-variance-authority';
import { ShellLogo } from '@/components/shell/logo';
import { HeaderOptions } from '@/components/shell/header/options';
import { ShellHeaderMobileMenu } from '@/components/shell/header/mobile/menu';
import { useViewport } from '@/context/viewport';
import {
  HEADER_HEIGHT,
  HEADER_HEIGHT_PADDING,
  HEADER_HEIGHT_SM,
} from '@/components/shell/header/constants';
import { useAuth } from '@/context/auth/provider';

export const ShellHeader = () => {
  const { isUserSignedIn } = useAuth();
  const viewport = useViewport();
  const isMobile = viewport.isDimensions && viewport.isSm;
  const height =
    (isMobile ? HEADER_HEIGHT_SM : HEADER_HEIGHT) +
    HEADER_HEIGHT_PADDING;

  return (
    <>
      <div style={{ height }} />
      <header
        className={cx(
          'fixed max-w-shell w-full',
          'top-0 inset-x-0 pt-3.5 px-6 z-20 sm:px-9',
          'z-10'
        )}
        style={{ height }}
      >
        <div
          className={cx(
            'relative',
            'flex items-center justify-between w-full',
            'pl-4.5 pr-2.5 py-2.5 sm:pl-7 sm:pr-2 sm:py-3'
          )}
        >
          <div
            className={cx(
              'absolute inset-0',
              'shadow-09 sm:shadow-08',
              'rounded-[0.70013rem] sm:rounded-15.1875',
              isUserSignedIn ? 'bg-white-5' : 'bg-white'
            )}
          />
          <Link className="relative z-10" href="/">
            <ShellLogo />
          </Link>
          {isMobile ? (
            <ShellHeaderMobileMenu />
          ) : (
            <HeaderOptions />
          )}
        </div>
      </header>
    </>
  );
};
