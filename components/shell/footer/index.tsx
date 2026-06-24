'use client';
import { cx } from 'class-variance-authority';
import { usePathname } from 'next/navigation';
import { ShellFooterLogo } from '@/components/shell/footer/logo';
import { ShellFooterTelephone } from '@/components/shell/footer/telephone';
import { ShellFooterEmail } from '@/components/shell/footer/email';

export const ShellFooter = () => {
  const pathname = usePathname();
  const isHiddenFooterRoute =
    pathname === '/' ||
    pathname === '/newLanding' ||
    pathname === '/plans' ||
    pathname.startsWith('/plans/') ||
    pathname === '/call' ||
    pathname.startsWith('/call/') ||
    pathname === '/call-demo' ||
    pathname.startsWith('/call-demo/') ||
    pathname === '/quotes' ||
    pathname === '/accountSettings' ||
    pathname === '/providerRegister' ||
    pathname.startsWith('/embed') ||
    pathname === '/landing0626';       // ← TakeShape homeowner landing

  if (isHiddenFooterRoute) {
    return null;
  }

  return (
    <div className="flex flex-col items-stretch">
      <footer
        style={{
          marginTop: '-0.9375rem',
        }}
        className="relative max-w-shell w-full mx-auto px-4 pb-10 sm:px-9"
      >
        <div
          className={cx(
            'flex flex-col items-stretch gap-12 w-full bg-white-1 px-9 pb-[29px] pt-[54px] rounded-footer',
            'lg:flex-row lg:items-end lg:gap-0'
          )}
        >
          <div className="grid w-full grid-cols-2 gap-x-4 gap-y-3 typography-footer-poppins text-black-1 lg:grid-cols-4 lg:items-center">
            <div className="flex items-center justify-center lg:justify-start lg:order-1">
              <ShellFooterLogo />
            </div>
            <div className="justify-self-center self-center text-center lg:order-3">
              <ShellFooterTelephone />
            </div>
            <span className="justify-self-start self-center pl-1 text-left lg:justify-self-start lg:pl-0 lg:text-left lg:order-4">
              Copyright 2026 TakeShape
            </span>
            <div className="justify-self-center self-center text-center lg:justify-self-end lg:text-right lg:order-2">
              <ShellFooterEmail />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
