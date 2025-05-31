// app/slam-visualization/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function SlamVisualization() {
  const [timestamp, setTimestamp] = useState<number>(Date.now());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Replace with your server's IP address
  const serverIP = '10.19.87.206';
  const screenshotUrl = `http://${serverIP}/screenshots/latest.jpg`;
  
  // Function to refresh the image
  const refreshImage = () => {
    setLoading(true);
    setTimestamp(Date.now());
  };
  
  // Auto-refresh every 2 seconds
  useEffect(() => {
    const intervalId = setInterval(refreshImage, 2000);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, []);
  
  // Handle image load/error
  const handleImageLoad = () => {
    setLoading(false);
    setError(null);
  };
  
  const handleImageError = () => {
    setLoading(false);
    setError('Failed to load visualization. Retrying...');
  };
  
  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            MASt3R-SLAM Visualization
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-300 sm:mt-4">
            Real-time 3D reconstruction visualization
          </p>
        </div>
        
        <div className="mt-10 bg-black rounded-lg overflow-hidden shadow-xl">
          <div className="relative">
            <div style={{ position: 'relative', width: '100%', height: '0', paddingBottom: '56.25%' }}>
              <Image
                src={`${screenshotUrl}?t=${timestamp}`}
                alt="MASt3R-SLAM Visualization"
                fill
                style={{ objectFit: 'contain' }}
                priority
                onLoadingComplete={handleImageLoad}
                onError={handleImageError}
                unoptimized={true}
              />
            </div>
            
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
              </div>
            )}
          </div>
          
          <div className="p-4 bg-gray-800 flex items-center justify-between">
            <div className="flex items-center">
              <div className={`h-3 w-3 rounded-full mr-2 ${error ? 'bg-red-500' : 'bg-green-500'}`}></div>
              <span className="text-sm text-gray-300">
                {error || 'Auto-refreshing every 2 seconds'}
              </span>
            </div>
            
            <button
              onClick={refreshImage}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Refresh Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
