import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Provider } from 'jotai';
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';

const open_sans = Open_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TakeShape",
  description: "Your home, your style, your terms",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Provider>
        <body className={`${open_sans.className} bg-floral-white`}>
          <Header/>
          {children}
          <Footer/>
        </body>
        <GoogleAnalytics gaId="G-47EYLN83WE" />
      </Provider>
    </html>
  );
}
