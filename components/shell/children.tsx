'use client';

import { FC, Suspense } from 'react';
import { cx } from 'class-variance-authority';
import { TPropsWithChildren } from '@/types/dom/main';
import { FallbacksLoading } from '@/components/fallbacks/loading';
import { usePathname } from 'next/navigation';

type TProps = TPropsWithChildren;
export const ShellChildren: FC<TProps> = ({ children }) => {
  const pathname = usePathname();
  const isHome = pathname === '/';
  return (
    <div
      className={cx(
        'relative min-h-[400px]',
        isHome ? 'my-0' : 'mt-8 mb-12',
        isHome ? 'min-h-screen' : 'min-h-[400px]'
      )}
    >
      <Suspense fallback={<FallbacksLoading />}>
        {children}
      </Suspense>
    </div>
  );
};
