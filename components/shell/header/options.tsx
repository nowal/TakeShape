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
import AccountButton from '../../buttons/accountButton';
import { usePathname } from 'next/navigation';

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
      {!isUserLoggedIn && (
        <SignInButton className="text-md hover:underline" {...props} />
      )}
      {!isQuotePage && <QuoteButton {...props} />}
      {isUserLoggedIn && <AccountButton />}
    </>
  );
};
