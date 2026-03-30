import type { FC } from 'react';
import { useAuth } from '@/context/auth/provider';
import { cx } from 'class-variance-authority';

export const ShellHeaderBackground: FC = () => {
  const { isUserSignedIn } = useAuth();

  return (
    <div
      className={cx(
        'absolute inset-0',
        'rounded-xl sm:rounded-2xl',
        'border border-black-08',
        'backdrop-blur-md',
        'shadow-09 sm:shadow-08',
        isUserSignedIn
          ? 'bg-[hsl(var(--app-bg-hsl)/98%)]'
          : 'bg-[hsl(var(--app-bg-hsl)/96%)]'
      )}
    />
  );
};
