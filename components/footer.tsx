'use client';

import React from 'react';
import logo from '../public/TakeShapeIcon.png';
import daltonLogo from '../public/daltonLogo.png';
import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="secondary-color py-8">
            <div className="container mx-auto px-4 flex flex-col items-center">
                <div className="flex items-center mb-4">
                    <img 
                        src={daltonLogo.src} 
                        alt="Logo"
                        className="h-16 w-16"
                    />
                    <h1 className="ml-2 text-lg font-bold">TakeShape</h1>
                </div>
                <Link href="/aboutUs" className="text-sm mt-2 hover:underline">
                        About Us
                </Link>
                <a href="mailto:takeshapehome@gmail.com?subject=Contact%20DwellDone" className="text-center text-sm">Contact Us</a>
                <a href="tel:+16158096429" className="text-center text-sm mt-2">(615) 809-6429</a>
            </div>
            <style jsx>{`
                .bg-footer {
                    background-color: #F7E4DE; /* Adjust the color as needed */
                }
            `}</style>
        </footer>
    );
};

export default Footer;
