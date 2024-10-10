'use client';
import Link from 'next/link';
import { IconsLogo } from '@/components/icons/logo';
import { cx } from 'class-variance-authority';
import { FC } from 'react';

export const ShellLogo: FC = (props) => {
  return (
    <Link
      className="flex items-center space-x-2 relative z-10"
      href="/"
    >
      <IconsLogo {...props} />
      <h1
        className={cx('typography-logo-title--responsive')}
      >
        TakeShape
      </h1>
    </Link>
  );
};
