'use client';

import React from 'react';
import CameraPermission from './CameraPermission';
import PointCloudViewer from './PointCloudViewer';
import RecordingToggleButton from './RecordingToggleButton';
import RelocalizationPrompt from './RelocalizationPrompt';

interface IPhoneScreenProps {
  onCameraReady: (stream: MediaStream, videoElement: HTMLVideoElement) => void;
  onCameraError: (error: string) => void;
  isRecording: boolean;
  onRecordingToggle: () => void;
  pointsData: { [key: string]: { points: number[][], colors: number[][] } };
  posesData: { position: number[], orientation: number[] }[];
  relocRequiredMsg: string | null;
  onFrameRendered: (frameId: number) => void;
}

export default function IPhoneScreen({
  onCameraReady,
  onCameraError,
  isRecording,
  onRecordingToggle,
  pointsData,
  posesData,
  relocRequiredMsg,
  onFrameRendered
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
      {/* Camera Feed - Full Background */}
      <CameraPermission
        onCameraReady={onCameraReady}
        onError={onCameraError}
        width={390}
        height={844}
      />
      
      {/* Point Cloud Viewer */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '25%', zIndex: 1, background: 'rgba(0, 0, 0, 0.5)' }}>
        <PointCloudViewer
          pointsData={pointsData}
          posesData={posesData}
          onFrameRendered={onFrameRendered}
        />
      </div>
      
      {/* Relocalization Prompt */}
      <RelocalizationPrompt message={relocRequiredMsg} />

      {/* Recording Toggle Button - Bottom Center */}
      <RecordingToggleButton
        isRecording={isRecording}
        onToggle={onRecordingToggle}
      />
    </div>
  );
}
