'use client';
import { IconsLogo } from '@/components/icons/logo';
import { cx } from 'class-variance-authority';
import { FC } from 'react';

export const ShellLogo: FC = (props) => {
  return (
    <div className="flex items-center space-x-2">
      <IconsLogo {...props} />
      <h1
        className={cx('typography-logo-title--responsive')}
      >
        TakeShape
      </h1>
    </div>
  );
};
