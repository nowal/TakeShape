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
        <header className={`${isHomePage ? 'fixed top-0 w-full z-50' : ''} secondary-color flex items-center justify-between border-b px-4 py-2 md:px-6 lg:px-8`}>
            <Link href="/" className="flex items-center space-x-2">
                <img src={logo.src} alt="Logo" className="h-14 w-14 md:h-16 md:w-16" /> {/* Increased size for mobile */}
                <h1 className="text-lg md:text-xl font-bold">Dwelling</h1> {/* Ensure text size is responsive */}
            </Link>
            <div className="flex items-center space-x-3 md:space-x-4">
                <QuoteButton text="Get Quote" className='text-base py-2 px-3 md:text-lg md:py-2 md:px-4'/> {/* Adjusted for better mobile interaction */}
                <DashboardButton text="Go To Dashboard" className='text-base py-2 px-3 md:text-lg md:py-2 md:px-4'/> {/* Adjusted for better mobile interaction */}
                <SignInButton className='text-base py-2 px-3 md:text-lg md:py-2 md:px-4'/> {/* Adjusted for better mobile interaction */}
            </div>
        </header>
    );
};

export default Header;
