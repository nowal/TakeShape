import React, { useEffect, useState } from 'react';

const LiDARBanner = () => {
  const [hasLiDAR, setHasLiDAR] = useState(false);

  useEffect(() => {
    const checkLiDAR = () => {
      const userAgent = navigator.userAgent;
      
      // Check if it's an iOS device
      const isiOS = /iPad|iPhone|iPod/.test(userAgent);
      
      if (!isiOS) return false;
      
      // List of devices with LiDAR
      const lidarDevices = [
        // iPhone models
        'iPhone 12 Pro',
        'iPhone 12 Pro Max',
        'iPhone 13 Pro',
        'iPhone 13 Pro Max',
        'iPhone 14 Pro',
        'iPhone 14 Pro Max',
        'iPhone 15 Pro',
        'iPhone 15 Pro Max',
        // iPad models
        'iPad Pro'
      ];
      
      // Check if device model matches any LiDAR-equipped devices
      return lidarDevices.some(device => userAgent.includes(device));
    };

    setHasLiDAR(checkLiDAR());
  }, []);

  if (!hasLiDAR) return null;

  return (
    <div className="w-full max-w-3xl mb-6 px-4 py-3 bg-blue-50 rounded-md">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-700">
          It looks like your phone has quick measurements enabled. Download our quick scanning app to get painting estimates sooner!
        </p>
        <button 
          className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          onClick={() => window.location.href = '/download-app'} // Replace with actual app download link
        >
          Download App
        </button>
      </div>
    </div>
  );
};

export default LiDARBanner;