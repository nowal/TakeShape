'use client';
import Link from 'next/link';
import { cx } from 'class-variance-authority';
import { ShellLogo } from '@/components/shell/logo';
import { HeaderOptions } from '@/components/shell/header/options';
import { ShellHeaderMobileMenu } from '@/components/shell/header/mobile/menu';
import { useViewport } from '@/context/viewport';
import { useAuth } from '@/context/auth/provider';
import { usePathname } from 'next/navigation';
import { InView } from '@/components/in-view';
import { Fragment } from 'react';
import { AnimationFadeUp } from '@/components/animation/fade-up';
import { ShellHeaderBackground } from '@/components/shell/header/background';

export const ShellHeader = () => {
  const { signIn } = useAuth();
  const pathname = usePathname();
  const isHome = pathname === '/';
  const viewport = useViewport();
  const height = viewport.headerHeight;

  return (
    <>
      <header
        className={cx(
          isHome ? 'fixed' : 'relative',
          'flex justify-center',
          'w-full',
          'top-0 inset-x-0 pt-3.5 z-20',
          'z-10'
        )}
      >
        <InView
          classValue={cx(
            'relative max-w-shell w-full',
            'px-6 sm:px-9'
          )}
          options={{ triggerOnce: true }}
        >
          {(props) => {
            if (!props.inView) return null;
            return (
              <AnimationFadeUp
                className={cx(
                  'relative',
                  'flex items-center justify-between w-full',
                  'pl-4.5 pr-2.5 py-2.5 sm:pl-7 sm:pr-2 sm:py-3'
                )}
                style={{ height }}
                delay={0.2}
              >
                <ShellHeaderBackground />
                <Link className="relative z-10" href="/">
                  <ShellLogo />
                </Link>
                {signIn.isAuthLoading ||
                !viewport.isDimensions ? (
                  <Fragment />
                ) : (
                  <>
                    {viewport.isSm ? (
                      <ShellHeaderMobileMenu />
                    ) : (
                      <HeaderOptions />
                    )}
                  </>
                )}
              </AnimationFadeUp>
            );
          }}
        </InView>
      </header>
    </>
  );
};
