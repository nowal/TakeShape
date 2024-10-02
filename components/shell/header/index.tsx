'use client';
import Link from 'next/link';
import { cx } from 'class-variance-authority';
import { ShellLogo } from '@/components/shell/logo';
import { HeaderOptions } from '@/components/shell/header/options';
import { ShellHeaderMobileMenu } from '@/components/shell/header/mobile/menu';
import { useViewport } from '@/context/viewport';
import { useAuth } from '@/context/auth/provider';
import { usePathname } from 'next/navigation';

export const ShellHeader = () => {
  const { isUserSignedIn, signIn } = useAuth();
  const pathname = usePathname();
  const isHome = pathname === '/';
  const viewport = useViewport();
  const height = viewport.headerHeight;

  return (
    <>
      {!isHome && <div style={{ height }} />}
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
          {!signIn.isAuthLoading && (
            <>
              {viewport.isDimensions && viewport.isSm ? (
                <ShellHeaderMobileMenu />
              ) : (
                <HeaderOptions />
              )}
            </>
          )}
        </div>
      </header>
    </>
  );
};
