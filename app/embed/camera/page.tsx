'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSimplifiedCamera } from '../hooks/useSimplifiedCamera';
import '../embed.css';

/**
 * Simplified Camera Page
 * This page provides a streamlined interface for capturing video and generating 3D models
 */
export default function CameraPage() {
  // Refs for DOM elements
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const timerRef = useRef<HTMLDivElement | null>(null);
  const modelViewerRef = useRef<HTMLDivElement | null>(null);

  // State
  const [currentView, setCurrentView] = useState<'camera' | 'roomList'>('camera');
  const [showInstructions, setShowInstructions] = useState(true);

  // Use the simplified camera hook
  const camera = useSimplifiedCamera({
    onReconstructionUpdate: (reconstruction) => {
      console.log('Reconstruction updated:', reconstruction);
      // Render the reconstruction in the model viewer
      renderReconstruction(reconstruction);
    },
    onRelocalizationNeeded: () => {
      console.log('Relocalization needed');
      // Show a notification to the user
      alert('Lost overlap. Please go back to last successful area.');
    },
    onRelocalizationSucceeded: () => {
      console.log('Relocalization succeeded');
      // Show a notification to the user
      alert('Successfully relocalized! Please continue scanning.');
    }
  });

  // Track initialization to prevent multiple initializations
  const hasInitializedRef = useRef(false);

  // Track capturing state locally to avoid React state issues
  const isCapturingRef = useRef(false);
  const recordingTimeRef = useRef(0);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const emergencyStopTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Force stop capturing function for emergency use
  const forceStopCapturing = useCallback(() => {
    console.log('EMERGENCY STOP: Force stopping capture');
    
    // Clear all intervals
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    
    // Reset local state
    isCapturingRef.current = false;
    
    // Update UI
    if (buttonRef.current) {
      buttonRef.current.classList.remove('recording');
      buttonRef.current.textContent = 'Start';
      buttonRef.current.disabled = false;
    }
    
    if (timerRef.current) {
      timerRef.current.classList.remove('visible');
    }
    
    // Force camera to stop capturing
    camera.resetCamera();
    
    // Reinitialize camera after a short delay
    setTimeout(() => {
      camera.initCamera().catch(error => {
        console.error('Error reinitializing camera:', error);
      });
    }, 1000);
    
    // Switch to room list view
    setCurrentView('roomList');
  }, [camera, setCurrentView]);

  // Initialize camera when component mounts
  useEffect(() => {
    // Prevent multiple initializations in development mode (React strict mode)
    if (hasInitializedRef.current) {
      console.log('Camera already initialized, skipping duplicate initialization');
      return;
    }
    
    hasInitializedRef.current = true;
    console.log('Camera page mounted, initializing camera');
    
    // Set refs
    camera.setRefs(videoRef.current, buttonRef.current, timerRef.current);
    console.log('Refs set:', {
      videoRef: videoRef.current ? 'exists' : 'null',
      buttonRef: buttonRef.current ? 'exists' : 'null',
      timerRef: timerRef.current ? 'exists' : 'null'
    });

    // Initialize camera
    camera.initCamera().catch(error => {
      console.error('Error initializing camera:', error);
      hasInitializedRef.current = false; // Allow retry if initialization fails
    });

    // Add loadedmetadata event listener to video element
    const videoElement = videoRef.current;
    
    // Define event handlers outside so they can be referenced in cleanup
    const handleVideoLoaded = () => {
      if (videoElement) {
        console.log('Video metadata loaded:', {
          videoWidth: videoElement.videoWidth,
          videoHeight: videoElement.videoHeight,
          readyState: videoElement.readyState
        });
        
        // Try to play the video after metadata is loaded
        if (videoElement.paused) {
          videoElement.play().catch(e => {
            console.warn('Auto-play failed after metadata loaded:', e);
          });
        }
      }
    };
    
    const handleVideoError = (error: Event) => {
      console.error('Video error:', error);
      hasInitializedRef.current = false; // Allow retry if video errors
    };
    
    if (videoElement) {
      console.log('Adding video event listeners');
      
      videoElement.addEventListener('loadedmetadata', handleVideoLoaded);
      videoElement.addEventListener('error', handleVideoError);
      
      // Try to play the video automatically
      if (videoElement.readyState >= 2) { // HAVE_CURRENT_DATA or better
        videoElement.play().catch(e => {
          console.warn('Auto-play failed, user interaction may be required:', e);
        });
      }
    }
    
    // Add a direct event listener to the button as a fallback
    // This ensures we can always stop the capture even if the React event handler fails
    const buttonElement = buttonRef.current;
    const handleDirectButtonClick = (e: Event) => {
      console.log('Direct button click detected');
      
      // If we're capturing, force stop
      if (isCapturingRef.current) {
        console.log('Direct button click: Force stopping capture');
        e.preventDefault();
        e.stopPropagation();
        
        // Call our force stop function
        forceStopCapturing();
        return false;
      }
      
      return true;
    };
    
    if (buttonElement) {
      console.log('Adding direct button event listener');
      buttonElement.addEventListener('click', handleDirectButtonClick, true);
    }

    // Hide instructions after 5 seconds
    const timer = setTimeout(() => {
      setShowInstructions(false);
    }, 5000);

    return () => {
      // Clean up event listeners
      if (videoElement) {
        videoElement.removeEventListener('loadedmetadata', handleVideoLoaded);
        videoElement.removeEventListener('error', handleVideoError);
      }
      
      // Clean up direct button event listener
      if (buttonElement) {
        buttonElement.removeEventListener('click', handleDirectButtonClick, true);
      }
      
      clearTimeout(timer);
      
      // Clean up recording interval if it exists
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      
      // Clean up emergency stop timeout if it exists
      if (emergencyStopTimeoutRef.current) {
        clearTimeout(emergencyStopTimeoutRef.current);
        emergencyStopTimeoutRef.current = null;
      }
    };
  }, [camera, forceStopCapturing]);

  // Render the reconstruction in the model viewer
  const renderReconstruction = (reconstruction: any) => {
    if (!modelViewerRef.current || !reconstruction) {
      return;
    }

    // Clear the model viewer
    modelViewerRef.current.innerHTML = '';

    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = modelViewerRef.current.clientWidth;
    canvas.height = modelViewerRef.current.clientHeight;
    modelViewerRef.current.appendChild(canvas);

    // Render the reconstruction on the canvas
    // This is a placeholder - in a real implementation, you would use a 3D rendering library
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#333';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`3D Model (${reconstruction.points?.length || 0} points)`, canvas.width / 2, canvas.height / 2);
    }
  };

  // Toggle between camera and room list views
  const toggleView = () => {
    // If we're in camera view and capturing, stop capturing before switching views
    if (currentView === 'camera' && camera.isCapturing) {
      camera.stopCapturing();
    }

    setCurrentView(currentView === 'camera' ? 'roomList' : 'camera');
  };

  // Handle camera button click
  const handleCameraButtonClick = () => {
    console.log('Camera button clicked, current state:', {
      isCapturing: isCapturingRef.current,
      isInitialized: camera.isInitialized,
      isConnected: camera.isConnected,
      sessionId: camera.sessionId
    });
    
    if (isCapturingRef.current) {
      console.log('Stopping capture');
      
      // Update UI immediately for better user feedback
      if (buttonRef.current) {
        buttonRef.current.classList.remove('recording');
        buttonRef.current.textContent = 'Start';
        // Do NOT disable the button during processing to ensure it can be clicked
        // buttonRef.current.disabled = true;
      }
      
      if (timerRef.current) {
        timerRef.current.classList.remove('visible');
      }
      
      // Stop our local timer
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      
      // Clear emergency stop timeout if it exists
      if (emergencyStopTimeoutRef.current) {
        clearTimeout(emergencyStopTimeoutRef.current);
        emergencyStopTimeoutRef.current = null;
      }
      
      // Reset local state
      isCapturingRef.current = false;
      
      camera.stopCapturing().then(() => {
        console.log('Capture stopped, switching to room list view');
        // Switch to room list view after stopping capture
        setCurrentView('roomList');
      }).catch(error => {
        console.error('Error stopping capture:', error);
        // Force stop if normal stop fails
        forceStopCapturing();
      });
    } else {
      console.log('Starting capture');
      
      // Update UI immediately for better user feedback
      if (buttonRef.current) {
        buttonRef.current.classList.add('recording');
        buttonRef.current.textContent = 'Stop';
        // Make sure button is not disabled
        buttonRef.current.disabled = false;
      }
      
      if (timerRef.current) {
        timerRef.current.classList.add('visible');
        timerRef.current.textContent = '0:00';
      }
      
      // Force video to play if it's paused
      if (videoRef.current && videoRef.current.paused) {
        videoRef.current.play().catch(e => console.warn('Could not play video on button click:', e));
      }
      
      // Set local capturing state
      isCapturingRef.current = true;
      recordingTimeRef.current = 0;
      
      // Start our own timer for UI updates
      recordingIntervalRef.current = setInterval(() => {
        recordingTimeRef.current += 1;
        console.log(`Local recording time: ${recordingTimeRef.current}s`);
        
        // Update timer display directly
        if (timerRef.current) {
          const minutes = Math.floor(recordingTimeRef.current / 60);
          const seconds = (recordingTimeRef.current % 60).toString().padStart(2, '0');
          timerRef.current.textContent = `${minutes}:${seconds}`;
        }
        
        // Check if video is black and try to restore it
        if (videoRef.current && videoRef.current.videoWidth > 0) {
          try {
            // Create a small canvas to check if video is black
            const testCanvas = document.createElement('canvas');
            testCanvas.width = 10;
            testCanvas.height = 10;
            const ctx = testCanvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(videoRef.current, 0, 0, 10, 10);
              const pixel = ctx.getImageData(5, 5, 1, 1);
              const isBlack = pixel.data[0] === 0 && pixel.data[1] === 0 && pixel.data[2] === 0;
              
              if (isBlack) {
                console.log('Video appears to be black, attempting to restore...');
                // Try to restore video by reattaching the stream
                if (videoRef.current.srcObject) {
                  const stream = videoRef.current.srcObject;
                  videoRef.current.srcObject = null;
                  setTimeout(() => {
                    if (videoRef.current) {
                      videoRef.current.srcObject = stream;
                      videoRef.current.play().catch(e => console.warn('Could not play video after restore:', e));
                    }
                  }, 100);
                }
              }
            }
          } catch (e) {
            console.error('Error checking if video is black:', e);
          }
        }
      }, 1000);
      
      // Set an emergency stop timeout in case something goes wrong
      emergencyStopTimeoutRef.current = setTimeout(() => {
        if (isCapturingRef.current && recordingTimeRef.current > 60) { // 1 minute timeout
          console.warn('Emergency stop timeout reached, forcing stop');
          forceStopCapturing();
        }
      }, 60000); // 1 minute
      
      // Start capturing in the hook
      camera.startCapturing();
      
      // Check if capturing state was updated after a short delay
      setTimeout(() => {
        console.log('Capture state after starting:', {
          hookIsCapturing: camera.isCapturing,
          localIsCapturing: isCapturingRef.current,
          recordingTime: camera.recordingTime,
          localRecordingTime: recordingTimeRef.current,
          currentBatchSize: camera.currentBatchSize
        });
        
        // If the timer isn't visible, try to make it visible manually
        if (timerRef.current && !timerRef.current.classList.contains('visible')) {
          console.log('Timer not visible, adding visible class manually');
          timerRef.current.classList.add('visible');
        }
        
        // If the button doesn't have the recording class, add it manually
        if (buttonRef.current && !buttonRef.current.classList.contains('recording')) {
          console.log('Button not in recording state, adding recording class manually');
          buttonRef.current.classList.add('recording');
          buttonRef.current.textContent = 'Stop';
          buttonRef.current.disabled = false;
        }
      }, 500);
    }
  };

  return (
    <div className="camera-page-container">
      <div className="camera-page">
        {/* Camera View */}
        <div className={`camera-view ${currentView === 'camera' ? '' : 'hidden'}`}>
          {/* Down arrow for toggling to room list */}
          <button className="toggle-view-button" onClick={toggleView}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Status message */}
          <div className="status-message">
            {camera.statusMessage}
          </div>

          {/* Video element */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="camera-video"
          />

          {/* Instructions overlay */}
          {showInstructions && (
            <div className="instructions-overlay" onClick={() => setShowInstructions(false)}>
              <div className="instructions-content">
                <h3>Camera Instructions</h3>
                <p>Press the button below to start capturing video.</p>
                <p>Move your camera slowly around the room to capture all surfaces.</p>
                <p>When finished, press the button again to stop and process the video.</p>
                <p>Tap anywhere to dismiss</p>
              </div>
            </div>
          )}

          {/* Timer */}
          <div ref={timerRef} className="recording-timer">
            {Math.floor(camera.recordingTime / 60)}:{(camera.recordingTime % 60).toString().padStart(2, '0')}
          </div>

          {/* Camera button */}
          <button
            ref={buttonRef}
            className={`camera-button ${camera.isCapturing ? 'recording' : ''}`}
            onClick={handleCameraButtonClick}
            disabled={!camera.isInitialized || !camera.isConnected}
          >
            {camera.isCapturing ? 'Stop' : 'Start'}
          </button>

          {/* Emergency stop button */}
          {isCapturingRef.current && (
            <button
              className="emergency-stop-button"
              onClick={forceStopCapturing}
            >
              Emergency Stop
            </button>
          )}
        </div>

        {/* Room List View */}
        <div className={`room-list-view ${currentView === 'roomList' ? '' : 'hidden'}`}>
          {/* Down arrow for toggling to camera */}
          <button className="toggle-view-button" onClick={toggleView}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Status message */}
          <div className="status-message">
            {camera.isProcessing ? 'Processing video...' : (camera.hasReconstruction ? '3D model ready' : 'No 3D model available')}
          </div>

          {/* Model viewer */}
          <div className="model-viewer-container">
            <div ref={modelViewerRef} className="model-viewer">
              {!camera.hasReconstruction && !camera.isProcessing && (
                <div className="no-model-message">
                  <p>No 3D model available</p>
                  <p>Capture video to generate a model</p>
                </div>
              )}
              {camera.isProcessing && (
                <div className="processing-message">
                  <div className="spinner"></div>
                  <p>Processing video...</p>
                </div>
              )}
            </div>
          </div>

          {/* Relocalization notification */}
          {camera.relocalizationMode !== 'none' && (
            <div className={`relocalization-notification ${camera.relocalizationMode}`}>
              <div className="relocalization-icon">
                {camera.relocalizationMode === 'needed' && '⚠️'}
                {camera.relocalizationMode === 'inProgress' && '🔄'}
                {camera.relocalizationMode === 'succeeded' && '✅'}
              </div>
              <div className="relocalization-message">
                {camera.relocalizationMode === 'needed' && 'Lost overlap. Please go back to last successful area.'}
                {camera.relocalizationMode === 'inProgress' && 'Relocalizing... Please scan areas you\'ve already captured.'}
                {camera.relocalizationMode === 'succeeded' && 'Successfully relocalized! Please continue scanning.'}
              </div>
            </div>
          )}

          {/* Capture more button */}
          <button
            className="capture-more-button"
            onClick={toggleView}
            disabled={camera.isProcessing}
          >
            Capture More
          </button>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .camera-page-container {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
          background-color: #f0f0f0;
        }

        .camera-page {
          position: relative;
          width: 100%;
          height: 650px;
          max-width: 500px;
          margin: 10px 0;
          background-color: #fff;
          overflow: hidden;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
          border-radius: 12px;
          max-height: 90vh;
        }

        .camera-view, .room-list-view {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          transition: transform 0.3s ease;
          overflow-y: auto;
        }

        .hidden {
          transform: translateX(100%);
        }

        .toggle-view-button {
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          background-color: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
        }

        .status-message {
          position: absolute;
          top: 60px;
          left: 0;
          right: 0;
          text-align: center;
          padding: 8px;
          background-color: rgba(0, 0, 0, 0.5);
          color: white;
          z-index: 5;
          font-size: 14px;
        }

        .camera-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          background-color: #000;
        }

        .instructions-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 20;
        }

        .instructions-content {
          background-color: white;
          padding: 20px;
          border-radius: 10px;
          max-width: 80%;
          text-align: center;
        }

        .recording-timer {
          position: absolute;
          top: 100px;
          left: 50%;
          transform: translateX(-50%);
          background-color: rgba(0, 0, 0, 0.6);
          color: white;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 18px;
          font-weight: bold;
          display: none;
          z-index: 5;
        }

        .recording-timer.visible {
          display: block;
        }

        .camera-button {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background-color: #ff4d4f;
          border: 6px solid white;
          color: white;
          font-size: 18px;
          font-weight: bold;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          z-index: 5;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
        }

        .camera-button.recording {
          background-color: #52c41a;
          animation: pulse 1.5s infinite;
        }

        .emergency-stop-button {
          position: absolute;
          bottom: 150px;
          left: 50%;
          transform: translateX(-50%);
          padding: 10px 20px;
          background-color: #ff4d4f;
          color: white;
          border: none;
          border-radius: 20px;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          z-index: 5;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        @keyframes pulse {
          0% { transform: translateX(-50%) scale(1); }
          50% { transform: translateX(-50%) scale(1.1); }
          100% { transform: translateX(-50%) scale(1); }
        }

        .camera-button:not(.recording)::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 2px solid #ff4d4f;
          animation: ring 2s infinite;
          opacity: 0;
        }

        @keyframes ring {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        .camera-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .model-viewer-container {
          flex: 1;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #f0f0f0;
          padding: 20px;
          box-sizing: border-box;
        }

        .model-viewer {
          width: 100%;
          height: 100%;
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
        }

        .no-model-message, .processing-message {
          text-align: center;
          color: #666;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 10px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .relocalization-notification {
          position: absolute;
          bottom: 20px;
          left: 20px;
          right: 20px;
          padding: 15px;
          border-radius: 10px;
          background-color: white;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          z-index: 10;
        }

        .relocalization-icon {
          font-size: 24px;
          margin-right: 10px;
        }

        .relocalization-message {
          flex: 1;
          font-size: 14px;
        }

        .capture-more-button {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          padding: 12px 24px;
          background-color: #1890ff;
          color: white;
          border: none;
          border-radius: 25px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          z-index: 5;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }

        .capture-more-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
