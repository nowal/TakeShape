"use client"
import { Montserrat, Open_Sans } from 'next/font/google';
import './reset.css';
import './globals.css';
import './typography.css';

const montserrat = Montserrat({ subsets: ['latin'] });
const openSans = Open_Sans({ subsets: ['latin'] });

export const CssGlobal = () => {
  return <style jsx global>
    {`
      :root {
        --font-sans: ${montserrat.style.fontFamily};
        --font-sans-secondary: ${openSans.style.fontFamily};
      }

      body {
        font-family: var(--font-sans);
        font-weight: 400;
      }
    `}
  </style>;
};
