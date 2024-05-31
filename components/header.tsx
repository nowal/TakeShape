'use client';

import React, { useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import logo from '../public/TakeShapeIcon.png';
import daltonLogo from '../public/daltonLogo.png'
import Link from 'next/link';
import AboutUsButton from './AboutUsButton';
import SignInButton from './signInButton';
import DashboardButton from './dashboardButton';
import QuoteButton from './quoteButton';
import { getAuth, signOut } from 'firebase/auth';


const Header = () => {
    const isHomePage = usePathname() === '/';
    const auth = getAuth();
    const TIMEOUT_DURATION = 1800 * 1000;

    const handleSignOut = useCallback(() => {
        signOut(auth).then(() => {
            console.log('User signed out due to inactivity.');
        }).catch((error) => {
            console.error('Error signing out: ', error);
        });
    }, [auth]);

    useEffect(() => {
        let signOutTimer = setTimeout(handleSignOut, TIMEOUT_DURATION);

        const resetTimer = () => {
            clearTimeout(signOutTimer);
            signOutTimer = setTimeout(handleSignOut, TIMEOUT_DURATION);
        };

        // Add event listeners for user activity
        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('keydown', resetTimer);

        return () => {
            // Clean up
            clearTimeout(signOutTimer);
            window.removeEventListener('mousemove', resetTimer);
            window.removeEventListener('keydown', resetTimer);
        };
    }, [handleSignOut]);


    return (
        <header className={`${isHomePage ? 'fixed top-0 w-full z-50' : ''} secondary-color flex items-center justify-between border-b px-4 py-2 sm:px-6 lg:px-8`}>
            <Link href="/" className="flex items-center space-x-2">
                <img src={daltonLogo.src} alt="Logo" className="h-10 w-10 md:h-16 md:w-16" /> {/* Adjusted size for mobile */}
                <h1 className="text-base md:text-xl font-bold">DwellDone</h1>
            </Link>
            <div className="flex items-center space-x-8 sm:space-x-3">
                {/*{isHomePage && (
                    <>
                        <Link href="/howItWorks" className="text-md hover:underline">
                            How It Works
                        </Link>
                        <Link href="/aboutUs" className="text-md hover:underline">
                            About Us
                        </Link>
                    </>
                )}*/}
                <AboutUsButton className="text-md hover:underline" />
                <SignInButton className="text-md hover:underline" />
                <QuoteButton text="Get Quote" className='text-sm sm:text-base md:text-lg py-2 px-3' />
                <DashboardButton text="Dashboard" className='text-sm sm:text-base md:text-lg py-2 px-3' />
            </div>
        </header>

    );
};

export default Header;
