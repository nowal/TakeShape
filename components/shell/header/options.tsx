'use client';
import {
  useEffect,
  useState,
  useCallback,
  FC,
} from 'react';
import SignInButton from '../../buttons/signInButton';
import QuoteButton from '../../buttons/quote/quoteButton';
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import { AccountMenu } from '../../buttons/account-menu';
import { usePathname } from 'next/navigation';
import { cx } from 'class-variance-authority';
import { ShellHeaderMobileMenu } from '@/components/shell/header/mobile/menu';

export type THeaderOptionsProps = Partial<{
  onClose(): void;
}>;
export const HeaderOptions: FC<THeaderOptionsProps> = (
  props
) => {
  const [isUserLoggedIn, setIsUserLoggedIn] =
    useState(false);
  const auth = getAuth();
  const TIMEOUT_DURATION = 1800 * 1000;
  const isQuotePage = usePathname() === '/quote';

  const handleSignOut = useCallback(() => {
    signOut(auth)
      .then(() => {
        console.log('User signed out due to inactivity.');
      })
      .catch((error) => {
        console.error('Error signing out: ', error);
      });
  }, [auth]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsUserLoggedIn(!!user);
    });

    let signOutTimer = setTimeout(
      handleSignOut,
      TIMEOUT_DURATION
    );

    const resetTimer = () => {
      clearTimeout(signOutTimer);
      signOutTimer = setTimeout(
        handleSignOut,
        TIMEOUT_DURATION
      );
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);

    return () => {
      unsubscribe();
      clearTimeout(signOutTimer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, [auth, handleSignOut]);

  return (
    <>
      <div className="hidden items-center px-4 gap-2.5 sm:px-2 lg:flex">
        {
          <div
            className={cx(
              'absolute inset-0',
              'shadow-09 lg:shadow-08',
              'rounded-[0.70013rem] lg:rounded-15.1875',
              isUserLoggedIn ? 'bg-white-5' : 'bg-white'
            )}
          />
        }
        {!isUserLoggedIn && (
          <SignInButton
            className="text-md hover:underline"
            {...props}
          />
        )}
        {!isQuotePage && <QuoteButton {...props} />}
        {isUserLoggedIn && <AccountMenu />}
      </div>
      <ShellHeaderMobileMenu />
    </>
  );
};
