'use client';

import React, { useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import logo from '../public/TakeShapeIcon.png';
import Link from 'next/link';
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
            console.log('Timer reset due to activity.');
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
        <header className={`${isHomePage ? 'fixed top-0 w-full z-50' : ''} secondary-color flex items-center justify-between border-b px-4 py-2 md:px-6 lg:px-8`}>
    <Link href="/" className="flex items-center space-x-2">
        <img src={logo.src} alt="Logo" className="h-10 w-10 md:h-16 md:w-16" /> {/* Adjusted size for mobile */}
        <h1 className="text-lg md:text-xl font-bold hidden sm:block">DwellDone</h1> {/* Hide text on very small screens */}
    </Link>
    <div className="flex items-center space-x-1 sm:space-x-3 md:space-x-4">
        <QuoteButton text="Get Quote" className='text-xs sm:text-base py-1 px-2 sm:py-2 sm:px-3 md:text-lg md:py-2 md:px-4'/> {/* Adjusted text size and padding for better mobile interaction */}
        <DashboardButton text="Dashboard" className='text-xs sm:text-base py-1 px-2 sm:py-2 sm:px-3 md:text-lg md:py-2 md:px-4'/> {/* Adjusted text size and padding for better mobile interaction */}
        <SignInButton className='text-xs sm:text-base py-1 px-2 sm:py-2 sm:px-3 md:text-lg md:py-2 md:px-4'/> {/* Adjusted text size and padding for better mobile interaction */}
    </div>
    <style jsx>{`
        @media (max-width: 640px) {
            .header-logo {
                height: 12px; /* Adjust logo size for extra-small devices */
                width: 12px;
            }
            .header-text {
                font-size: 14px; /* Adjust font size for extra-small devices */
            }
            .button-text {
                font-size: 12px; /* Adjust button text size for extra-small devices */
            }
        }
    `}</style>
</header>

    );
};

export default Header;
