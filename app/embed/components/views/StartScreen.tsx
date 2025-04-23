'use client';

import React, { FC } from 'react';

interface StartScreenProps {
  isVisible: boolean;
  businessName?: string;
  homeownerName?: string;
  serviceType?: string;
  primaryColor?: string;
  onStartCapture: () => void;
  onScheduleInHome: () => void;
}

/**
 * Start screen component shown after contact intake and before camera view
 */
const StartScreen: FC<StartScreenProps> = ({
  isVisible,
  businessName,
  homeownerName,
  serviceType = 'painted',
  primaryColor = '#ff385c',
  onStartCapture,
  onScheduleInHome
}) => {
  if (!isVisible) return null;

  // Use the primary color for buttons
  const buttonStyle = {
    backgroundColor: primaryColor,
  };

  return (
    <div className="view start-screen">
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {businessName ? `${businessName} Quote` : 'Get Your Quote'}
        </h2>
        
        <div className="mb-6">
          <p className="text-lg font-medium mb-4">
            {homeownerName ? `Hi ${homeownerName}! ` : ''}
            We actually offer the ability to get a guaranteed instant quote with a few pictures of your house. All you&apos;ll need is:
          </p>
          
          <ol className="list-decimal pl-6 mb-6 space-y-2">
            <li>A phone with a camera</li>
            <li>The ability to take 4 photos of each room or area you want {serviceType}</li>
            <li>About 5 minutes</li>
          </ol>
          
          <p className="mb-6">
            Do you want to get an instant quote or have someone reach out to schedule an in-home estimate?
          </p>
        </div>
        
        <div className="flex flex-col space-y-3">
          <button
            onClick={onStartCapture}
            className="w-full py-3 px-4 rounded-md text-white font-medium transition duration-300 hover:opacity-90"
            style={buttonStyle}
          >
            Get instant quote
          </button>
          
          <button
            onClick={onScheduleInHome}
            className="w-full py-3 px-4 rounded-md bg-gray-200 text-gray-800 font-medium transition duration-300 hover:bg-gray-300"
          >
            Schedule in-home estimate
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;
