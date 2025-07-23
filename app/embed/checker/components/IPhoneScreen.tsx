'use client';

import React from 'react';
import CameraPermission from './CameraPermission';
import RecordingToggleButton from './RecordingToggleButton';
import LoadingScreen from './LoadingScreen';
import ResultsScreen from './ResultsScreen';

interface IPhoneScreenProps {
  onCameraReady: (stream: MediaStream, videoElement: HTMLVideoElement) => void;
  onCameraError: (error: string) => void;
  isRecording: boolean;
  onRecordingToggle: () => void;
  screenMode: 'camera' | 'loading' | 'results';
  finalPointCloudData?: number[];
  onBackToCamera?: () => void;
}

export default function IPhoneScreen({
  onCameraReady,
  onCameraError,
  isRecording,
  onRecordingToggle,
  screenMode,
  finalPointCloudData = [],
  onBackToCamera
}: IPhoneScreenProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: '390px',
        height: '844px',
        backgroundColor: '#000',
        borderRadius: '30px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        border: '8px solid #1c1c1e',
        margin: '0 auto',
      }}
    >
      {screenMode === 'camera' ? (
        <>
          {/* Camera Feed - Full Background */}
          <CameraPermission
            onCameraReady={onCameraReady}
            onError={onCameraError}
            width={390}
            height={844}
          />
          
          {/* Recording Toggle Button - Bottom Center */}
          <RecordingToggleButton
            isRecording={isRecording}
            onToggle={onRecordingToggle}
          />
        </>
      ) : screenMode === 'loading' ? (
        /* Loading Screen - Full Screen */
        <LoadingScreen />
      ) : (
        /* Results Screen - Full Screen */
        <ResultsScreen 
          pointCloudData={finalPointCloudData}
          onBack={onBackToCamera}
        />
      )}
    </div>
  );
}
