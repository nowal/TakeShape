"use client"
import { Montserrat } from 'next/font/google';
import './reset.css';
import './globals.css';

const montserrat = Montserrat({ subsets: ['latin'] });

export const CssGlobal = () => {
  return <style jsx global>
    {`
      :root {
        --font-sans: ${montserrat.style.fontFamily};
      }

      body {
        font-family: var(--font-sans);
        font-weight: 400;
      }
    `}
  </style>;
};
