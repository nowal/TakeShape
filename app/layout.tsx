import type { Metadata } from 'next';
import { ShellHeader } from '@/components/shell/header';
import { ShellFooter } from '@/components/shell/footer';
import Script from 'next/script';
import { Provider } from 'jotai';
import { GoogleAnalytics } from '@next/third-parties/google';
import { CssGlobal } from '@/css/global';
import { ViewportProvider } from '@/context/viewport';
import { AuthProvider } from '@/context/auth/provider';
import { ReactNode, Suspense } from 'react';
import { SignInModal } from '@/components/sign-in/modal';
import { DashboardProvider } from '@/context/dashboard/provider';

export const metadata: Metadata = {
  title: 'TakeShape',
  description: 'Your home, your style, your terms',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <Provider>
        <body className="font-montserrat">
          <CssGlobal />
          <div className="fixed inset-0 bg-white-6" />
          <div className="relative flex flex-col items-stretch max-w-shell w-full mx-auto">
            <ShellHeader />
            <Suspense fallback={<div>Loading...</div>}>
              <AuthProvider>
                <Suspense fallback={<div>Loading...</div>}>
                  <DashboardProvider>
                    <Suspense
                      fallback={<div>Loading...</div>}
                    >
                      <ViewportProvider>
                        <Suspense
                          fallback={<div>Loading...</div>}
                        >
                          {children}
                        </Suspense>
                      </ViewportProvider>
                    </Suspense>
                  </DashboardProvider>
                </Suspense>
              </AuthProvider>
            </Suspense>
            <ShellFooter />
          </div>
          <SignInModal />
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
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1`}
            />
          </noscript>
        </body>

        <GoogleAnalytics gaId="G-47EYLN83WE" />
      </Provider>
    </html>
  );
}
