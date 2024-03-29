'use client';

import React from 'react';
import logo from '../public/TakeShapeIcon.png';
import daltonLogo from '../public/daltonLogo.png'

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
                    <h1 className="ml-2 text-lg font-bold">DwellDone</h1>
                </div>
                <a href="mailto:dwelldonehelp@gmail.com?subject=Contact%20DwellDone" className="text-center text-sm">Contact Us</a>
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
