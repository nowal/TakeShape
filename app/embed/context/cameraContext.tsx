'use client';

import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';

// Settings for frame extraction
const FRAME_EXTRACTION_SETTINGS = {
  JPEG_QUALITY: 0.7, // 70% quality
  CANVAS_WIDTH: 640,
  CANVAS_HEIGHT: 480
};

// Define the context shape
interface CameraContextType {
  isInitialized: boolean;
  isRecording: boolean;
  isFrameSending: boolean;
  recordingTime: number;
  errorMessage: string | null;
  initCamera: () => Promise<void>;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  startFrameSending: () => void;
  stopFrameSending: () => void;
  resetCamera: () => void;
  captureFrame: () => string | null;
  setRefs: (
    videoRef: HTMLVideoElement | null,
    buttonRef: HTMLButtonElement | null,
    timerRef: HTMLDivElement | null
  ) => void;
}

// Create the context
const CameraContext = createContext<CameraContextType | null>(null);

export const CameraProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isFrameSending, setIsFrameSending] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const timerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const frameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Set refs from outside
  const setRefs = useCallback((
    newVideoRef: HTMLVideoElement | null,
    newButtonRef: HTMLButtonElement | null,
    newTimerRef: HTMLDivElement | null
  ) => {
    videoRef.current = newVideoRef;
    buttonRef.current = newButtonRef;
    timerRef.current = newTimerRef;
  }, []);
  
  // Initialize camera
  const initCamera = useCallback(async () => {
    // If already initialized and stream is active, just return
    if (isInitialized && streamRef.current && videoRef.current && videoRef.current.srcObject) {
      return;
    }
    
    try {
      console.log('Initializing camera');
      setErrorMessage(null);
      
      // First, enumerate all video devices to find the back cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      // Start with strict constraints to force back camera with high quality
      const strictConstraints = {
        video: {
          facingMode: 'environment', // Force back camera
          width: { ideal: 1920 }, // HD width
          height: { ideal: 1080 }, // HD height
        },
        audio: true // Enable audio for video recording
      } as MediaStreamConstraints;
      
      try {
        // First try with strict constraints
        const stream = await navigator.mediaDevices.getUserMedia(strictConstraints);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        // Store the stream in the ref
        streamRef.current = stream;
      } catch (strictError) {
        console.warn('Failed to access camera with strict constraints, trying fallback');
        
        // Fallback to less strict constraints if the above fails
        const fallbackConstraints = {
          video: {
            facingMode: 'environment', // Prefer back camera but don't require it
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: true // Enable audio for video recording
        } as MediaStreamConstraints;
        
        const fallbackStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
        }
        
        // Store the stream in the ref
        streamRef.current = fallbackStream;
      }
      
      // Create a canvas for frame extraction if it doesn't exist
      if (!canvasRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = FRAME_EXTRACTION_SETTINGS.CANVAS_WIDTH;
        canvas.height = FRAME_EXTRACTION_SETTINGS.CANVAS_HEIGHT;
        canvasRef.current = canvas;
      }
      
      // Update state
      setIsInitialized(true);
      
    } catch (error) {
      // Type guard for Error objects
      const err = error instanceof Error ? error : new Error(String(error));
      
      console.error('Error accessing camera:', err.message);
      
      // Update state
      setIsInitialized(false);
      setErrorMessage(err.message);
      
      // Show a more detailed error message
      alert(`Unable to access camera: ${err.message}. Please ensure camera permissions are granted and try again.`);
    }
  }, [isInitialized]);
  
  // Start frame sending
  const startFrameSending = useCallback(() => {
    if (!isInitialized || !streamRef.current) {
      console.warn('Cannot start frame sending: camera not initialized');
      return;
    }
    
    if (isFrameSending) {
      console.warn('Frame sending already active');
      return;
    }
    
    console.log('Starting frame sending');
    
    // Set state to indicate frames are being sent
    setIsFrameSending(true);
    
    // Add recording class to button if it exists
    if (buttonRef.current) {
      buttonRef.current.classList.add('recording');
    }
  }, [isInitialized, isFrameSending]);
  
  // Stop frame sending
  const stopFrameSending = useCallback(() => {
    if (!isFrameSending) {
      console.warn('Frame sending not active');
      return;
    }
    
    console.log('Stopping frame sending');
    
    // Set state to indicate frames are not being sent
    setIsFrameSending(false);
    
    // Remove recording class from button if it exists
    if (buttonRef.current) {
      buttonRef.current.classList.remove('recording');
    }
  }, [isFrameSending]);
  
  // Stop recording
  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || !isRecording) {
      return;
    }
    
    try {
      // Stop the MediaRecorder
      mediaRecorderRef.current.stop();
      
      // Remove recording class from button
      if (buttonRef.current) {
        buttonRef.current.classList.remove('recording');
      }
      
      // Hide timer
      if (timerRef.current) {
        timerRef.current.classList.remove('visible');
      }
      
    } catch (error) {
      // Type guard for Error objects
      const err = error instanceof Error ? error : new Error(String(error));
      
      console.error('Error stopping recording:', err.message);
      
      // Update state
      setErrorMessage(err.message);
      
      // Show a more detailed error message
      alert(`Failed to stop recording: ${err.message}`);
    }
  }, [isRecording]);
  
  // Reset camera
  const resetCamera = useCallback(() => {
    // Stop recording if it's in progress
    if (isRecording) {
      stopRecording();
    }
    
    // Stop frame sending if it's active
    if (isFrameSending) {
      stopFrameSending();
    }
    
    // Only stop the camera stream if there's an error
    if (errorMessage) {
      // Stop all tracks in the stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      // Clear the video element
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      // Reset state
      setIsInitialized(false);
    }
    
    // Reset recording state
    setIsRecording(false);
    setRecordingTime(0);
    chunksRef.current = [];
    
    // Clear recording interval
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
  }, [isRecording, isFrameSending, errorMessage, stopRecording, stopFrameSending]);
  
  // Start recording
  const startRecording = useCallback(async () => {
    if (!streamRef.current || isRecording) {
      console.warn('Cannot start recording: stream not available or already recording');
      return;
    }
    
    try {
      // Create a new MediaRecorder instance
      const options = { mimeType: 'video/webm;codecs=vp9,opus' };
      
      try {
        mediaRecorderRef.current = new MediaRecorder(streamRef.current, options);
      } catch (e) {
        console.warn('VP9 codec not supported, trying VP8');
        
        // Try with VP8 codec
        const fallbackOptions = { mimeType: 'video/webm;codecs=vp8,opus' };
        
        try {
          mediaRecorderRef.current = new MediaRecorder(streamRef.current, fallbackOptions);
        } catch (e2) {
          console.warn('VP8 codec not supported, trying without codec specification');
          
          // Try without codec specification
          mediaRecorderRef.current = new MediaRecorder(streamRef.current);
        }
      }
      
      // Clear previous chunks
      chunksRef.current = [];
      
      // Set up event handlers
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        // Reset recording state
        setIsRecording(false);
        setRecordingTime(0);
        
        // Clear recording interval
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }
      };
      
      // Start recording
      mediaRecorderRef.current.start(1000); // Collect data every second
      
      // Update UI
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Add recording class to button
      if (buttonRef.current) {
        buttonRef.current.classList.add('recording');
      }
      
      // Show timer
      if (timerRef.current) {
        timerRef.current.classList.add('visible');
      }
      
    } catch (error) {
      // Type guard for Error objects
      const err = error instanceof Error ? error : new Error(String(error));
      
      console.error('Error starting recording:', err.message);
      
      // Update state
      setIsRecording(false);
      setErrorMessage(err.message);
      
      // Show a more detailed error message
      alert(`Failed to start recording: ${err.message}`);
    }
  }, [isRecording]);
  
  // Capture a single frame
  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) {
      return null;
    }
    
    try {
      const context = canvasRef.current.getContext('2d');
      if (!context) {
        return null;
      }
      
      // Draw the current video frame to the canvas
      context.drawImage(
        videoRef.current, 
        0, 0, 
        canvasRef.current.width, 
        canvasRef.current.height
      );
      
      // Convert the canvas to a data URL
      const frameData = canvasRef.current.toDataURL(
        'image/jpeg', 
        FRAME_EXTRACTION_SETTINGS.JPEG_QUALITY
      );
      
      return frameData;
    } catch (error) {
      console.error('Error capturing frame:', error);
      return null;
    }
  }, []);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Stop recording if it's in progress
      if (isRecording) {
        stopRecording();
      }
      
      // Stop frame sending if it's active
      if (isFrameSending) {
        stopFrameSending();
      }
      
      // Stop all tracks in the stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      // Clear recording interval
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      
      // Clear frame interval
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
      }
    };
  }, [isRecording, isFrameSending, stopRecording, stopFrameSending]);
  
  // Context value
  const contextValue: CameraContextType = {
    isInitialized,
    isRecording,
    isFrameSending,
    recordingTime,
    errorMessage,
    initCamera,
    startRecording,
    stopRecording,
    startFrameSending,
    stopFrameSending,
    resetCamera,
    captureFrame,
    setRefs
  };
  
  return (
    <CameraContext.Provider value={contextValue}>
      {children}
    </CameraContext.Provider>
  );
};

// Custom hook to use the camera context
export const useCamera = () => {
  const context = useContext(CameraContext);
  if (!context) {
    throw new Error('useCamera must be used within a CameraProvider');
  }
  return context;
};
