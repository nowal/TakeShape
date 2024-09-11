'use client';
import {
  Montserrat,
  Open_Sans,
  Poppins,
} from 'next/font/google';
import './reset.css';
import './globals.css';
import './typography.css';

const montserrat = Montserrat({ subsets: ['latin'] });
const openSans = Open_Sans({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['500'],
});
console.log(montserrat)
export const CssGlobal = () => {
  return (
    <style jsx global>
      {`
        :root {
          --font-montserrat: ${montserrat.style.fontFamily};
          --font-open-sans: ${openSans.style
            .fontFamily};
          --font-poppins: ${poppins.style.fontFamily};
        }

        body {
          font-family: ${montserrat.className};
          font-weight: 400;
        }
      `}
    </style>
  );
};
