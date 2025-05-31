import { useState, useRef, useCallback, useEffect } from 'react';
import { useCamera } from '../context/cameraContext';
// We'll still import useSocket for type compatibility, but we won't actually use it for connections
import { useSocket } from '../context/socketContext';
// Import the new batch processing hook
import { useBatchProcessing } from '../context/batchProcessingContext';

interface UseRealtimeVideoCameraProps {
  sessionId: string | null;
  onReconstructionUpdate?: (reconstruction: any) => void;
  onRelocalizationNeeded?: () => void;
  onRelocalizationSucceeded?: () => void;
}

interface UseRealtimeVideoCameraReturn {
  isRecording: boolean;
  isFrameSending: boolean;
  recordingTime: number;
  isConnected: boolean;
  isConnecting: boolean;
  isProcessing: boolean;
  isRelocalizing: boolean;
  relocalizationMode: 'needed' | 'inProgress' | 'succeeded';
  frameCount: number;
  keyframeCount: number;
  sectionCount: number;
  currentMode: string;
  initCamera: () => Promise<void>;
  resetCamera: () => void;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  startFrameSending: () => void;
  stopFrameSending: () => void;
  toggleFrameSending: () => void;
  setRefs: (
    videoRef: HTMLVideoElement | null,
    buttonRef: HTMLButtonElement | null,
    timerRef: HTMLDivElement | null
  ) => void;
  clearRelocalizationNotification: () => void;
  sendTestFrame: () => void; // Method to send a test frame
}

/**
 * Hook for managing real-time video camera functionality
 * This version is a wrapper around useBatchVideoProcessing for backward compatibility
 */
export const useRealtimeVideoCamera = ({
  sessionId,
  onReconstructionUpdate,
  onRelocalizationNeeded,
  onRelocalizationSucceeded
}: UseRealtimeVideoCameraProps): UseRealtimeVideoCameraReturn => {
  // State for relocalization notification
  const [relocalizationMode, setRelocalizationMode] = useState<'needed' | 'inProgress' | 'succeeded'>('inProgress');
  const [showRelocalizationSuccess, setShowRelocalizationSuccess] = useState(false);
  
  // Use the contexts
  const camera = useCamera();
  const socket = useSocket(); // Keep for type compatibility
  const batchProcessing = useBatchProcessing(); // Use the new batch processing context
  
  // Refs
  const frameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isFrameSendingActiveRef = useRef<boolean>(false);
  const framesSentRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const initCompletedRef = useRef<boolean>(false);
  const testFrameSentRef = useRef<boolean>(false);
  
  // Set up reconstruction update handler
  useEffect(() => {
    if (onReconstructionUpdate) {
      // Pass the reconstruction update handler to the batch processing context
      console.log('Socket connections are disabled - using batch processing instead');
    }
  }, [onReconstructionUpdate]);
  
  // Send a test frame - now just a no-op
  const sendTestFrame = useCallback(() => {
    console.log('Socket connections are disabled - using batch processing instead');
    // No actual frame to send
  }, []);
  
  // Initialize camera and batch processing
  const initCamera = useCallback(async () => {
    try {
      // Only initialize once
      if (initCompletedRef.current) {
        console.log('Camera and session already initialized, skipping initialization');
        return;
      }
      
      console.log(`Initializing camera with session ID: ${sessionId}`);
      
      // Initialize the camera - this only sets up the video stream
      await camera.initCamera();
      
      // Initialize the batch processing session
      await batchProcessing.initializeSession();
      
      // Mark initialization as complete
      initCompletedRef.current = true;
      
      console.log('Batch video processing fully initialized');
      
    } catch (error) {
      console.error('Error initializing batch video processing:', error);
    }
  }, [camera, batchProcessing, sessionId]);
  
  // Reset camera and batch processing
  const resetCamera = useCallback(() => {
    console.log('Resetting batch video processing');
    
    // Reset frame sending state
    isFrameSendingActiveRef.current = false;
    framesSentRef.current = 0;
    
    // Reset camera
    camera.resetCamera();
    
    // Reset batch processing
    batchProcessing.resetSession();
    
    // Reset initialization flag
    initCompletedRef.current = false;
    testFrameSentRef.current = false;
  }, [camera, batchProcessing]);
  
  // Start frame sending - now uses batch processing
  const startFrameSending = useCallback(() => {
    console.log('Starting batch frame sending');
    
    // If already sending frames, just return
    if (isFrameSendingActiveRef.current) {
      console.log('Frame sending already active, skipping');
      return;
    }
    
    // Start frame sending in camera context - this only updates the UI state
    camera.startFrameSending();
    
    // Set frame sending active flag
    isFrameSendingActiveRef.current = true;
    
    // Start batch processing
    batchProcessing.sendFrameBatch([]);
    
    console.log('Batch frame sending started');
  }, [camera, batchProcessing]);
  
  // Stop frame sending - now uses batch processing
  const stopFrameSending = useCallback(() => {
    console.log('Stopping batch frame sending');
    
    // If not sending frames, just return
    if (!isFrameSendingActiveRef.current) {
      console.log('Frame sending not active, skipping');
      return;
    }
    
    // Stop frame sending in camera context - this only updates the UI state
    camera.stopFrameSending();
    
    // Set frame sending inactive flag
    isFrameSendingActiveRef.current = false;
    
    console.log('Batch frame sending stopped');
  }, [camera]);
  
  // Toggle frame sending
  const toggleFrameSending = useCallback(() => {
    console.log(`Toggling frame sending. Current state: ${camera.isFrameSending ? 'active' : 'inactive'}`);
    
    if (camera.isFrameSending || isFrameSendingActiveRef.current) {
      stopFrameSending();
    } else {
      startFrameSending();
    }
  }, [camera.isFrameSending, startFrameSending, stopFrameSending, isFrameSendingActiveRef]);
  
  // Start recording
  const startRecording = useCallback(async () => {
    try {
      // Start recording with the camera
      await camera.startRecording();
      
      console.log('Real-time recording started');
    } catch (error) {
      console.error('Error starting real-time recording:', error);
    }
  }, [camera]);
  
  // Stop recording
  const stopRecording = useCallback(async () => {
    try {
      // Stop recording with the camera
      await camera.stopRecording();
      
      console.log('Real-time recording stopped');
    } catch (error) {
      console.error('Error stopping real-time recording:', error);
    }
  }, [camera]);
  
  // Set refs
  const setRefs = useCallback((
    videoRef: HTMLVideoElement | null,
    buttonRef: HTMLButtonElement | null,
    timerRef: HTMLDivElement | null
  ) => {
    // Set refs using the camera context
    camera.setRefs(videoRef, buttonRef, timerRef);
  }, [camera]);
  
  // Clear relocalization notification
  const clearRelocalizationNotification = useCallback(() => {
    setShowRelocalizationSuccess(false);
  }, []);
  
  // Monitor frame sending status
  useEffect(() => {
    // Check if frames are being sent
    const checkFrameSending = () => {
      if (isFrameSendingActiveRef.current && lastFrameTimeRef.current > 0) {
        const now = Date.now();
        const timeSinceLastFrame = now - lastFrameTimeRef.current;
        
        // If no frames have been sent for more than 2 seconds, log a warning
        if (timeSinceLastFrame > 2000) {
          console.warn(`No frames sent for ${timeSinceLastFrame}ms. Check camera and socket connection.`);
        }
      }
    };
    
    // Set up interval to check frame sending status
    const monitorInterval = setInterval(checkFrameSending, 2000);
    
    // Clean up on unmount
    return () => {
      clearInterval(monitorInterval);
      
      // Stop frame extraction
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
      }
      
      // Reset frame sending state
      isFrameSendingActiveRef.current = false;
    };
  }, []);
  
  return {
    // Camera state
    isRecording: camera.isRecording,
    isFrameSending: camera.isFrameSending || isFrameSendingActiveRef.current,
    recordingTime: camera.recordingTime,
    
    // Batch processing state instead of socket state
    isConnected: batchProcessing.isInitialized,
    isConnecting: !batchProcessing.isInitialized && batchProcessing.isProcessing,
    isProcessing: batchProcessing.isProcessing,
    isRelocalizing: false, // No relocalization in batch processing
    relocalizationMode,
    frameCount: batchProcessing.batchesSent * 10, // Approximate frame count
    keyframeCount: batchProcessing.batchesProcessed * 2, // Approximate keyframe count
    sectionCount: 1, // Default section count
    currentMode: 'BATCH', // Special mode to indicate batch processing
    
    // Methods
    initCamera,
    resetCamera,
    startRecording,
    stopRecording,
    startFrameSending,
    stopFrameSending,
    toggleFrameSending,
    setRefs,
    clearRelocalizationNotification,
    sendTestFrame // Expose the method
  };
};
