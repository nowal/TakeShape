'use client';
import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import SignInButton from './signInButton';
import QuoteButton from './quoteButton';
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import AccountButton from './accountButton';
import { cx } from 'class-variance-authority';
import { IconsLogo } from '@/components/icons/logo';

const Header = () => {
  const [isUserLoggedIn, setIsUserLoggedIn] =
    useState(false);
  const isHomePage = usePathname() === '/';
  const auth = getAuth();
  const TIMEOUT_DURATION = 1800 * 1000;

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
    <header
      className={cx(
        'top-0 inset-x-0 pt-3.5 px-9 z-50',
        isHomePage ? 'fixed max-w-shell w-full mx-auto' : 'relative',
      )}
    >
      <div
        className={cx(
          'flex items-center justify-between w-full',
          'bg-white',
          'rounded-15.1875',
          'px-4 py-2 sm:px-6 lg:pl-7 lg:pr-2 lg:py-3',
          'shadow-08'
        )}
      >
        <Link
          href="/"
          className="flex items-center space-x-2"
        >
          <IconsLogo />
          {/* <img
          src={daltonLogo.src}
          alt="Logo"
          className="h-10 w-10 md:h-16 md:w-16"
        />{' '} */}
          {/* Adjusted size for mobile */}
          <h1 className="title">
            TakeShape
          </h1>
        </Link>
        <div className="flex items-center space-x-4 sm:space-x-2">
          {!isUserLoggedIn && (
            <SignInButton className="text-md hover:underline" />
          )}
          <QuoteButton
            text="Get Quote"
            className="text-sm sm:text-base md:text-lg py-2 px-3"
          />
          {isUserLoggedIn && <AccountButton />}
        </div>
      </div>
    </header>
  );
};

export default Header;
