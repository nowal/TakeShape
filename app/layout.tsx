import type { Metadata } from 'next';
import { ShellHeader } from '@/components/shell/header';
import { ShellFooter } from '@/components/shell/footer';
import Script from 'next/script';
import { Provider } from 'jotai';
import { GoogleAnalytics } from '@next/third-parties/google';
import { CssGlobal } from '@/css/global';
import { CSSProperties, ReactNode, Suspense } from 'react';
import { SignInModal } from '@/components/sign-in/modal';
import { ContextProviders } from '@/context/providers';
import { ShellChildren } from '@/components/shell/children';
import { MotionConfig } from 'framer-motion';
import { MOTION_CONFIG } from '@/constants/animation';
import { LibsToastify } from '@/components/libs/toastify';
import { PRIMARY_COLOR_HSL } from '@/constants/brand-color';

import '../css/inputs.css';
import '../css/reset.css';
import '../css/typography/index.css';
import '../css/globals.css';
import '../css/notifications.css';
import 'react-toastify/dist/ReactToastify.min.css';
import { FallbacksLogoFill } from '@/components/fallbacks/logo/fill';

export const metadata: Metadata = {
  title: 'TakeShape',
  description: 'Your home, your style, your terms',
};
type TProps = Readonly<{
  children: ReactNode;
}>;
export default function RootLayout({ children }: TProps) {
  const primaryColorVars = {
    '--primary-h': `${PRIMARY_COLOR_HSL.hue}`,
    '--primary-s': `${PRIMARY_COLOR_HSL.saturation}%`,
    '--primary-l': `${PRIMARY_COLOR_HSL.lightness}%`,
  } as CSSProperties;

  return (
    <html lang="en" style={primaryColorVars}>
      <CssGlobal />
      <Provider>
        <body className="font-montserrat">
          <div className="fixed inset-0 bg-white" />
          <div className="relative flex flex-col items-stretch max-w-shell w-full mx-auto">
            <MotionConfig transition={MOTION_CONFIG}>
              <ContextProviders>
                <ShellHeader />
                <ShellChildren>{children}</ShellChildren>
                <ShellFooter />
                <Suspense fallback={<FallbacksLogoFill />}>
                  <SignInModal />
                </Suspense>
              </ContextProviders>
            </MotionConfig>
            <LibsToastify />
          </div>
          <Script
            id="facebook-pixel"
            strategy="afterInteractive"
          >
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '457576220590263');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            {/* eslint-disable @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=457576220590263&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </body>
        <GoogleAnalytics gaId="G-47EYLN83WE" />
      </Provider>
    </html>
  );
}
