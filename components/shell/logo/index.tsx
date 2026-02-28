'use client';
import Link from 'next/link';
import { IconsLogo } from '@/components/icons/logo';
import { cx } from 'class-variance-authority';
import { FC } from 'react';
import { useAuth } from '@/context/auth/provider';

export const ShellLogo: FC<{ backgroundColor?: string }> = ({ backgroundColor, ...props }) => {
  const { isUserSignedIn, menu } = useAuth();
  const { isAgent, isPainter } = menu;
  const href =
    isUserSignedIn && isPainter && !isAgent
      ? '/call'
      : '/';

  return (
    <Link
      className="flex items-center space-x-2 relative"
      href={href}
    >
      <IconsLogo {...props} backgroundColor={backgroundColor} />
      <h1 className={cx('typography-logo-title--responsive')}>
        TakeShape
      </h1>
    </Link>
  );
};
