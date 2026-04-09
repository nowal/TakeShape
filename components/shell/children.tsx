'use client';;
import { FC, Suspense } from 'react';
import { cx } from 'class-variance-authority';
import { TPropsWithChildren } from '@/types/dom/main';
import { usePathname } from 'next/navigation';
import { FallbacksLogoFill } from '@/components/fallbacks/logo/fill';

type TProps = TPropsWithChildren;
export const ShellChildren: FC<TProps> = ({ children }) => {
  const pathname = usePathname();
  const isLanding =
    pathname === '/landing' || pathname === '/newLanding';
  const isEmbed = pathname.startsWith('/embed');
  return (
    <div
      className={cx(
        'relative min-h-[400px] flex-1',
        isLanding || isEmbed ? 'my-0' : 'mt-8 mb-12',
        isLanding
          ? 'min-h-screen'
          : isEmbed
          ? 'min-h-0'
          : 'min-h-[400px]'
      )}
    >
      <Suspense fallback={<FallbacksLogoFill />}>
        {children}
      </Suspense>
    </div>
  );
};
