'use client';

import { useEffect } from 'react';
import CameraPage from './page';

/**
 * Test page for the camera functionality
 */
export default function CameraTest() {
  useEffect(() => {
    console.log('Camera test page loaded');
  }, []);

  return (
    <div className="camera-test">
      <CameraPage />
    </div>
  );
}
