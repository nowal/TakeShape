'use client';

import { ReactNode } from 'react';
import './RoomScanner.css';
import Script from 'next/script';

interface LayoutProps {
  children: ReactNode;
}

export default function RoomScannerLayout({ children }: LayoutProps) {
  return (
    <div className="room-scanner-layout">
      {/* Load Three.js scripts */}
      <Script 
        src="https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.min.js" 
        strategy="beforeInteractive"
      />
      <Script 
        src="https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/loaders/GLTFLoader.js" 
        strategy="beforeInteractive"
        // GLTFLoader depends on THREE, so we need to ensure it loads after THREE
        onLoad={() => {
          console.log('GLTFLoader loaded');
        }}
      />
      <Script 
        src="https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/controls/OrbitControls.js" 
        strategy="beforeInteractive"
        // OrbitControls depends on THREE, so we need to ensure it loads after THREE
        onLoad={() => {
          console.log('OrbitControls loaded');
        }}
      />
      
      {children}
    </div>
  );
}
