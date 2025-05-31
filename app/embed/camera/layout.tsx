'use client';

import { ReactNode, useEffect } from 'react';

interface CameraLayoutProps {
  children: ReactNode;
}

/**
 * Layout for the camera page
 */
export default function CameraLayout({ children }: CameraLayoutProps) {
  // Add viewport meta tag for proper mobile display
  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof document !== 'undefined') {
      // Look for existing viewport meta tag
      let viewportMeta = document.querySelector('meta[name="viewport"]');
      
      // If it doesn't exist, create it
      if (!viewportMeta) {
        viewportMeta = document.createElement('meta');
        viewportMeta.setAttribute('name', 'viewport');
        document.head.appendChild(viewportMeta);
      }
      
      // Set the viewport content for optimal mobile display
      viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
    }
  }, []);

  return (
    <div className="camera-layout">
      {children}
      <style jsx global>{`
        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background-color: #f0f0f0;
          overscroll-behavior: none; /* Prevent pull-to-refresh */
          touch-action: manipulation; /* Optimize for touch */
        }
        
        .camera-layout {
          width: 100%;
          min-height: 100vh;
          min-height: calc(var(--vh, 1vh) * 100); /* Use custom viewport height */
          display: flex;
          justify-content: center;
          align-items: flex-start; /* Align to top instead of center */
          padding: 0;
          background-color: #f0f0f0;
          overflow-y: auto; /* Allow scrolling if needed */
        }
        
        /* Fix for iOS Safari 100vh issue */
        @supports (-webkit-touch-callout: none) {
          .camera-layout {
            height: -webkit-fill-available;
          }
        }
      `}</style>
      
      {/* Script to handle mobile viewport height issues */}
      <script dangerouslySetInnerHTML={{
        __html: `
          // Set custom viewport height variable
          function setVH() {
            let vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', \`\${vh}px\`);
          }
          
          // Set on initial load
          setVH();
          
          // Update on resize
          window.addEventListener('resize', setVH);
        `
      }} />
    </div>
  );
}
