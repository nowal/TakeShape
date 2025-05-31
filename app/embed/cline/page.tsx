'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCamera } from '../context/cameraContext';
import { useBatchProcessing } from '../context/batchProcessingContext';
import RelocalizationNotification from '../components/ui/RelocalizationNotification';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import * as flaskApiService from './services/flaskApiService';
import { usePointCloudRenderer } from './hooks/usePointCloudRenderer';

// View modes
enum ViewMode {
  CAMERA = 'camera',
  MODEL = 'model',
}

// Relocalization states
enum RelocalizationState {
  NONE = 'none',
  NEEDED = 'needed',
  IN_PROGRESS = 'inProgress',
  SUCCEEDED = 'succeeded',
}

const ClinePage: React.FC = () => {
  // State
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.CAMERA);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pointCloudData, setPointCloudData] = useState<{
    points: number[][];
    colors: number[][];
  } | null>(null);
  const [relocalizationState, setRelocalizationState] = useState<RelocalizationState>(
    RelocalizationState.NONE
  );
  const [showRelocalizationNotification, setShowRelocalizationNotification] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modelViewerRef = useRef<HTMLDivElement>(null);
  const loadingIndicatorRef = useRef<HTMLDivElement>(null);
  const recordButtonRef = useRef<HTMLButtonElement>(null);
  const timerRef = useRef<HTMLDivElement>(null);
  const frameBufferRef = useRef<string[]>([]);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const processingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Use contexts
  const camera = useCamera();
  const batchProcessing = useBatchProcessing();

  // Initialize on mount
  useEffect(() => {
    // Load saved view mode from localStorage
    const savedViewMode = localStorage.getItem('cline-view-mode');
    if (savedViewMode && Object.values(ViewMode).includes(savedViewMode as ViewMode)) {
      setViewMode(savedViewMode as ViewMode);
    }

    // Initialize session and camera
    initializeSession();

    // Cleanup on unmount
    return () => {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
      }
      if (processingIntervalRef.current) {
        clearInterval(processingIntervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Save view mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('cline-view-mode', viewMode);
  }, [viewMode]);

  // Set camera refs when they're available
  useEffect(() => {
    if (videoRef.current && recordButtonRef.current && timerRef.current) {
      camera.setRefs(videoRef.current, recordButtonRef.current, timerRef.current);
    }
  }, [camera]);

  // Initialize session with the Flask backend
  const initializeSession = async () => {
    try {
      // Initialize camera
      await camera.initCamera();

      // Start a new session with the Flask backend
      const data = await flaskApiService.startSession();
      setSessionId(data.session_id);
      setIsInitialized(true);
      console.log('Session initialized with ID:', data.session_id);

      // Start polling for processing status
      startProcessingStatusPolling(data.session_id);
    } catch (error) {
      console.error('Error initializing session:', error);
    }
  };

  // Start polling for processing status
  const startProcessingStatusPolling = (sid: string) => {
    if (processingIntervalRef.current) {
      clearInterval(processingIntervalRef.current);
    }

    processingIntervalRef.current = setInterval(async () => {
      try {
        const data = await flaskApiService.checkProcessingStatus(sid);
        
        // Update processing state
        setIsProcessing(!data.processing_complete);
        
        // Check if we have a reconstruction
        if (data.processing_complete && data.has_reconstruction) {
          await fetchReconstruction(sid);
        }
      } catch (error) {
        console.error('Error checking processing status:', error);
      }
    }, 2000);
  };

  // Fetch reconstruction data
  const fetchReconstruction = async (sid: string) => {
    try {
      const data = await flaskApiService.getReconstruction(sid);
      
      if (data.reconstruction && 
          Array.isArray(data.reconstruction.points) && 
          data.reconstruction.points.length > 0 &&
          Array.isArray(data.reconstruction.colors) && 
          data.reconstruction.colors.length > 0) {
        
        setPointCloudData({
          points: data.reconstruction.points,
          colors: data.reconstruction.colors
        });
        
        // Switch to model view if we're not already there
        if (viewMode !== ViewMode.MODEL) {
          setViewMode(ViewMode.MODEL);
        }
        
        // Stop processing polling
        if (processingIntervalRef.current) {
          clearInterval(processingIntervalRef.current);
          processingIntervalRef.current = null;
        }
      }
    } catch (error) {
      console.error('Error fetching reconstruction:', error);
    }
  };

  // Toggle between camera and model views
  const toggleView = () => {
    setViewMode(prev => (prev === ViewMode.CAMERA ? ViewMode.MODEL : ViewMode.CAMERA));
  };

  // Start recording video
  const startRecording = async () => {
    if (!sessionId || isRecording) return;

    try {
      // Initialize camera if not already done
      if (!camera.isInitialized) {
        await camera.initCamera();
      }

      // Start recording
      await camera.startRecording();
      setIsRecording(true);

      // Start capturing frames
      startCapturingFrames();
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  // Stop recording video
  const stopRecording = async () => {
    if (!isRecording) return;

    try {
      // Stop recording
      await camera.stopRecording();
      setIsRecording(false);

      // Stop capturing frames
      stopCapturingFrames();

      // Process the captured frames
      await processFrames();

      // Switch to model view and show loading indicator
      setViewMode(ViewMode.MODEL);
      setIsProcessing(true);
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  // Start capturing frames
  const startCapturingFrames = () => {
    // Clear frame buffer
    frameBufferRef.current = [];

    // Start capturing frames at 10 FPS
    captureIntervalRef.current = setInterval(() => {
      const frame = camera.captureFrame();
      if (frame) {
        frameBufferRef.current.push(frame);
      }
    }, 100); // 10 FPS
  };

  // Stop capturing frames
  const stopCapturingFrames = () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
  };

  // Process captured frames
  const processFrames = async () => {
    if (!sessionId || frameBufferRef.current.length === 0) return;

    try {
      const data = await flaskApiService.processFrames(sessionId, frameBufferRef.current);
      
      // Check for relocalization
      if (data.relocalization_needed) {
        setRelocalizationState(RelocalizationState.NEEDED);
        setShowRelocalizationNotification(true);
      } else if (data.relocalization_successful) {
        setRelocalizationState(RelocalizationState.SUCCEEDED);
        setShowRelocalizationNotification(true);
        
        // Auto-hide the notification after 5 seconds
        setTimeout(() => {
          setShowRelocalizationNotification(false);
        }, 5000);
      }
      
      // Check if we have a reconstruction
      if (data.reconstruction) {
        setPointCloudData({
          points: data.reconstruction.points,
          colors: data.reconstruction.colors
        });
      }
    } catch (error) {
      console.error('Error processing frames:', error);
    }
  };

  // Enter relocalization mode
  const enterRelocalizationMode = async () => {
    if (!sessionId) return;

    try {
      await flaskApiService.enterRelocalizationMode(sessionId);
      setRelocalizationState(RelocalizationState.IN_PROGRESS);
      setViewMode(ViewMode.CAMERA);
    } catch (error) {
      console.error('Error entering relocalization mode:', error);
    }
  };

  // Close relocalization notification
  const closeRelocalizationNotification = () => {
    setShowRelocalizationNotification(false);
    
    // If relocalization is needed, enter relocalization mode
    if (relocalizationState === RelocalizationState.NEEDED) {
      enterRelocalizationMode();
    }
  };

  // Use the point cloud renderer hook
  const { renderPointCloud } = usePointCloudRenderer({
    containerRef: modelViewerRef,
    pointCloudData,
    isVisible: viewMode === ViewMode.MODEL
  });

  return (
    <div className="cline-container">
      <div className="cline-phone-frame">
        {/* Camera View */}
        <div className={`cline-view ${viewMode === ViewMode.CAMERA ? 'active' : ''}`}>
          <div className="cline-header">
            <button className="toggle-button" onClick={toggleView}>
              ▼
            </button>
          </div>
          
          <div className="camera-container">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="camera-video"
            />
            
            <div ref={timerRef} className="recording-timer">
              {Math.floor(camera.recordingTime / 60)}:{(camera.recordingTime % 60).toString().padStart(2, '0')}
            </div>
            
            <div className="camera-controls">
              <button
                ref={recordButtonRef}
                className={`record-button ${isRecording ? 'recording' : ''}`}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!isInitialized}
              >
                <div className="record-button-inner"></div>
              </button>
            </div>
          </div>
        </div>
        
        {/* Model View */}
        <div className={`cline-view ${viewMode === ViewMode.MODEL ? 'active' : ''}`}>
          <div className="cline-header">
            <button className="toggle-button" onClick={toggleView}>
              ▼
            </button>
          </div>
          
          <div className="model-container">
            <div ref={modelViewerRef} className="model-viewer">
              {!pointCloudData && !isProcessing && (
                <div className="no-model-message">
                  <p>No model available</p>
                  <p>Capture video to generate a 3D model</p>
                </div>
              )}
            </div>
            
            {isProcessing && (
              <div className="loading-overlay">
                <div className="spinner"></div>
                <p>Processing video...</p>
                <p className="loading-subtitle">This may take a few minutes</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Relocalization Notification */}
        {showRelocalizationNotification && (
          <RelocalizationNotification
            isVisible={showRelocalizationNotification}
            mode={
              relocalizationState === RelocalizationState.NEEDED
                ? 'needed'
                : relocalizationState === RelocalizationState.IN_PROGRESS
                ? 'inProgress'
                : 'succeeded'
            }
            onClose={closeRelocalizationNotification}
          />
        )}
      </div>
      
      {/* Styles */}
      <style jsx>{`
        .cline-container {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100vh;
          background-color: #f5f5f5;
          padding: 20px;
        }
        
        .cline-phone-frame {
          position: relative;
          width: 100%;
          max-width: 375px;
          height: 667px;
          background-color: white;
          border-radius: 40px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
        }
        
        .cline-view {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          transition: opacity 0.3s ease, transform 0.3s ease;
          opacity: 0;
          pointer-events: none;
          transform: translateX(100%);
          background-color: #000;
        }
        
        .cline-view.active {
          opacity: 1;
          pointer-events: auto;
          transform: translateX(0);
        }
        
        .cline-header {
          height: 60px;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: rgba(0, 0, 0, 0.8);
          z-index: 10;
        }
        
        .toggle-button {
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          padding: 10px;
          transition: transform 0.3s ease;
        }
        
        .toggle-button:hover {
          transform: translateY(5px);
        }
        
        .camera-container {
          flex: 1;
          position: relative;
          overflow: hidden;
          background-color: #000;
        }
        
        .camera-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .recording-timer {
          position: absolute;
          top: 20px;
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
        
        .camera-controls {
          position: absolute;
          bottom: 40px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          z-index: 5;
        }
        
        .record-button {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background-color: white;
          border: 4px solid rgba(255, 255, 255, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .record-button-inner {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background-color: #ff0000;
          transition: all 0.3s ease;
        }
        
        .record-button.recording {
          background-color: #ff0000;
        }
        
        .record-button.recording .record-button-inner {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          background-color: white;
        }
        
        .record-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .model-container {
          flex: 1;
          position: relative;
          overflow: hidden;
          background-color: #000;
        }
        
        .model-viewer {
          width: 100%;
          height: 100%;
          background-color: #000;
        }
        
        .no-model-message {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100%;
          color: white;
          text-align: center;
          padding: 20px;
        }
        
        .no-model-message p {
          margin: 5px 0;
        }
        
        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.8);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 10;
          color: white;
        }
        
        .spinner {
          width: 50px;
          height: 50px;
          border: 5px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }
        
        .loading-subtitle {
          font-size: 14px;
          opacity: 0.7;
          margin-top: 5px;
        }
        
        .error-message {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100%;
          color: #ff4d4f;
          text-align: center;
          padding: 20px;
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        @media (max-height: 700px) {
          .cline-phone-frame {
            height: 90vh;
          }
        }
        
        @media (max-width: 400px) {
          .cline-phone-frame {
            max-width: 100%;
            height: 100vh;
            border-radius: 0;
          }
          
          .cline-container {
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ClinePage;
