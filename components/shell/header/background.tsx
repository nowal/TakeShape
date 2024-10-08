import type { FC } from 'react';
import { useAuth } from '@/context/auth/provider';
import { cx } from 'class-variance-authority';

export const ShellHeaderBackground: FC = () => {
  const { isUserSignedIn, signIn } = useAuth();

  return (
    <div
      className={cx(
        'absolute inset-0',
        'shadow-09 sm:shadow-08',
        'rounded-[0.70013rem] sm:rounded-15.1875',
        isUserSignedIn ? 'bg-white-5' : 'bg-white'
      )}
    />
  );
};
