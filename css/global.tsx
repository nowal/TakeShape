'use client';
import { Barlow } from 'next/font/google';

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const CssGlobal = () => {
  return (
    <style jsx global>
      {`
        :root {
          --font-montserrat: ${barlow.style.fontFamily};
          --font-open-sans: ${barlow.style.fontFamily};
          --font-poppins: ${barlow.style.fontFamily};
          --font-barlow: ${barlow.style.fontFamily};
        }

        body {
          font-family: ${barlow.style.fontFamily};
          font-weight: 500;
        }
      `}
    </style>
  );
};
