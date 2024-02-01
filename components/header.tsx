'use client';

import React from 'react';
import logo from '../public/TakeShapeIcon.png';
import Link from 'next/link';
import SignInButton from './signInButton';
import PainterRegisterButton from './painterRegisterButton';
import DashboardButton from './dashboardButton';
import QuoteButton from './quoteButton';

const Header = () => {
    return (
        <header className="fixed top-0 w-full secondary-color flex items-center justify-between border-b z-50"> {/* Add fixed, top-0, w-full, and z-50 classes */}
            <Link className="flex items-center" href="/"> {/* Link to the home page */}
                <img 
                    src={logo.src} 
                    alt="Logo"
                    className="ml-4 h-16 w-16"
                />
                <h1 className="ml-2 text-xl font-bold">TakeShape</h1>
            </Link>
            <div className="flex items-center mr-6 space-x-4">
                <QuoteButton text="Get Quote" className='py-2 px-4'/>
                <DashboardButton text="Go To Dashboard"/>
                <SignInButton/>
            </div>
            <style jsx>{`
                .bg-floral-white {
                    background-color: #F7E4DE; /* Adjust the color as needed */
                }
                .shadow {
                    box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
                }
            `}</style>
        </header>
    );
};

export default Header;


