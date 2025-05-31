import { useState, useRef, useCallback, useEffect } from 'react';
import { useCamera } from '../context/cameraContext';
import { useBatchProcessing } from '../context/batchProcessingContext';

interface UseBatchVideoProcessingProps {
  sessionId?: string | null;
  onReconstructionUpdate?: (reconstruction: any) => void;
  onRelocalizationNeeded?: () => void;
  onRelocalizationSucceeded?: () => void;
  batchInterval?: number; // Default to 5000ms (5 seconds)
  framesPerSecond?: number; // Default to 10 FPS
}

interface UseBatchVideoProcessingReturn {
  isRecording: boolean;
  isCapturing: boolean;
  recordingTime: number;
  isConnected: boolean;
  isInitialized: boolean;
  isProcessing: boolean;
  batchesSent: number;
  batchesProcessed: number;
  currentBatchSize: number;
  hasReconstruction: boolean;
  initCamera: () => Promise<void>;
  resetCamera: () => void;
  startCapturing: () => void;
  stopCapturing: () => Promise<void>;
  setRefs: (
    videoRef: HTMLVideoElement | null,
    buttonRef: HTMLButtonElement | null,
    timerRef: HTMLDivElement | null
  ) => void;
}

/**
 * Hook for managing batch video processing
 * This version uses the camera and batch processing contexts
 */
export const useBatchVideoProcessing = ({
  sessionId: externalSessionId,
  onReconstructionUpdate,
  onRelocalizationNeeded,
  onRelocalizationSucceeded,
  batchInterval = 5000, // 5 seconds
  framesPerSecond = 10 // 10 FPS
}: UseBatchVideoProcessingProps): UseBatchVideoProcessingReturn => {
  // State
  const [isCapturing, setIsCapturing] = useState(false);
  const [currentBatchSize, setCurrentBatchSize] = useState(0);
  
  // Use the contexts
  const camera = useCamera();
  const processing = useBatchProcessing();
  
  // Refs
  const frameBufferRef = useRef<string[]>([]);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const batchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const initCompletedRef = useRef<boolean>(false);
  
  // Initialize camera and session
  const initCamera = useCallback(async () => {
    try {
      // Only initialize once
      if (initCompletedRef.current) {
        console.log('Camera and session already initialized, skipping initialization');
        return;
      }
      
      console.log(`Initializing camera with session ID: ${externalSessionId || 'new'}`);
      
      // Initialize the camera - this only sets up the video stream
      await camera.initCamera();
      
      // Initialize the session
      await processing.initializeSession();
      
      // Mark initialization as complete
      initCompletedRef.current = true;
      
      console.log('Batch video processing fully initialized');
    } catch (error) {
      console.error('Error initializing batch video processing:', error);
    }
  }, [camera, processing, externalSessionId]);
  
  // Send current batch of frames
  const sendCurrentBatch = useCallback(async () => {
    if (frameBufferRef.current.length === 0) {
      return;
    }
    
    // Make a copy of the current frames
    const framesToSend = [...frameBufferRef.current];
    
    // Clear the buffer
    frameBufferRef.current = [];
    setCurrentBatchSize(0);
    
    console.log(`Sending batch of ${framesToSend.length} frames`);
    
    try {
      // Send the frames
      await processing.sendFrameBatch(framesToSend);
    } catch (error) {
      console.error('Error sending frame batch:', error);
    }
  }, [processing]);
  
  // Stop capturing frames
  const stopCapturing = useCallback(async () => {
    if (!isCapturing) {
      console.warn('Not capturing frames');
      return;
    }
    
    console.log('Stopping frame capturing');
    
    // Set capturing state
    setIsCapturing(false);
    
    // Stop camera frame sending UI state
    camera.stopFrameSending();
    
    // Clear intervals
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
    
    if (batchIntervalRef.current) {
      clearInterval(batchIntervalRef.current);
      batchIntervalRef.current = null;
    }
    
    // Send any remaining frames
    await sendCurrentBatch();
    
    console.log('Frame capturing stopped');
  }, [camera, isCapturing, sendCurrentBatch]);
  
  // Reset camera
  const resetCamera = useCallback(() => {
    console.log('Resetting batch video processing');
    
    // Stop capturing if active
    if (isCapturing) {
      stopCapturing();
    }
    
    // Reset camera
    camera.resetCamera();
    
    // Reset processing
    processing.resetSession();
    
    // Reset state
    setIsCapturing(false);
    setCurrentBatchSize(0);
    
    // Reset refs
    frameBufferRef.current = [];
    initCompletedRef.current = false;
  }, [camera, processing, isCapturing, stopCapturing]);
  
  // Start capturing frames
  const startCapturing = useCallback(() => {
    if (!camera.isInitialized || !processing.isInitialized) {
      console.warn('Cannot start capturing: camera or processing not initialized');
      return;
    }
    
    if (isCapturing) {
      console.warn('Already capturing frames');
      return;
    }
    
    console.log('Starting frame capturing');
    
    // Set capturing state
    setIsCapturing(true);
    
    // Start camera frame sending UI state
    camera.startFrameSending();
    
    // Calculate capture interval based on FPS
    const captureIntervalMs = Math.floor(1000 / framesPerSecond);
    
    // Start capturing frames at regular intervals
    captureIntervalRef.current = setInterval(() => {
      const frame = camera.captureFrame();
      if (frame) {
        frameBufferRef.current.push(frame);
        setCurrentBatchSize(frameBufferRef.current.length);
      }
    }, captureIntervalMs);
    
    // Start batch interval to send frames every batchInterval ms
    batchIntervalRef.current = setInterval(() => {
      sendCurrentBatch();
    }, batchInterval);
    
    console.log(`Frame capturing started with interval ${captureIntervalMs}ms, batch interval ${batchInterval}ms`);
  }, [camera, processing, isCapturing, framesPerSecond, batchInterval, sendCurrentBatch]);
  
  // Set refs
  const setRefs = useCallback((
    videoRef: HTMLVideoElement | null,
    buttonRef: HTMLButtonElement | null,
    timerRef: HTMLDivElement | null
  ) => {
    // Set refs using the camera context
    camera.setRefs(videoRef, buttonRef, timerRef);
  }, [camera]);
  
  // Handle reconstruction updates
  useEffect(() => {
    if (processing.reconstruction && onReconstructionUpdate) {
      onReconstructionUpdate(processing.reconstruction);
    }
  }, [processing.reconstruction, onReconstructionUpdate]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Stop capturing if active
      if (isCapturing) {
        if (captureIntervalRef.current) {
          clearInterval(captureIntervalRef.current);
        }
        
        if (batchIntervalRef.current) {
          clearInterval(batchIntervalRef.current);
        }
      }
    };
  }, [isCapturing]);
  
  return {
    // Camera state
    isRecording: camera.isRecording,
    isCapturing,
    recordingTime: camera.recordingTime,
    
    // Processing state
    isConnected: processing.isInitialized,
    isInitialized: camera.isInitialized && processing.isInitialized,
    isProcessing: processing.isProcessing,
    batchesSent: processing.batchesSent,
    batchesProcessed: processing.batchesProcessed,
    currentBatchSize,
    hasReconstruction: processing.hasReconstruction,
    
    // Methods
    initCamera,
    resetCamera,
    startCapturing,
    stopCapturing,
    setRefs
  };
};
