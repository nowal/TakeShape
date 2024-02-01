'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import logo from '../public/TakeShapeIcon.png';
import Link from 'next/link';
import SignInButton from './signInButton';
import DashboardButton from './dashboardButton';
import QuoteButton from './quoteButton';

const Header = () => {
    const isHomePage = usePathname() === '/';

    return (
        <header className={`${isHomePage ? 'fixed top-0 w-full z-50' : ''} secondary-color flex items-center justify-between border-b px-4 sm:px-6 lg:px-8`}>
            <Link href="/" className="flex items-center space-x-2">
                <img src={logo.src} alt="Logo" className="h-12 w-12 sm:h-16 sm:w-16" />
                <h1 className="hidden sm:block text-lg sm:text-xl font-bold">TakeShape</h1>
            </Link>
            <div className="flex items-center space-x-2 sm:space-x-4">
                <QuoteButton text="Get Quote" className='text-sm sm:text-base py-1 sm:py-2 px-2 sm:px-4'/>
                <DashboardButton text="Go To Dashboard" className='text-sm sm:text-base'/>
                <SignInButton className='text-sm sm:text-base py-1 sm:py-2 px-2 sm:px-4'/>
            </div>
        </header>
    );
};

export default Header;
