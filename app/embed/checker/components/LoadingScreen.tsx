'use client';

import React from 'react';

interface LoadingScreenProps {
  message?: string;
  subtitle?: string;
}

export default function LoadingScreen({
  message = 'Processing your 3D model...',
  subtitle = 'This may take a few minutes'
}: LoadingScreenProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        zIndex: 10,
      }}
    >
      {/* Loading Spinner */}
      <div
        style={{
          width: '60px',
          height: '60px',
          border: '4px solid rgba(255, 255, 255, 0.3)',
          borderTop: '4px solid #007AFF',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '24px',
        }}
      />
      
      {/* Main Message */}
      <h2
        style={{
          fontSize: '20px',
          fontWeight: '600',
          margin: '0 0 12px 0',
          textAlign: 'center',
          color: 'white',
        }}
      >
        {message}
      </h2>
      
      {/* Subtitle */}
      {subtitle && (
        <p
          style={{
            fontSize: '16px',
            fontWeight: '400',
            margin: '0',
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.7)',
            maxWidth: '280px',
            lineHeight: '1.4',
          }}
        >
          {subtitle}
        </p>
      )}
      
      {/* CSS Animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
