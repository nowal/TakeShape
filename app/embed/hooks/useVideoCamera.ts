import { useState, useRef, useCallback } from 'react';

interface UseVideoCameraProps {
  onVideoReady?: (video: Blob) => void;
  sessionId?: string | null;
}

interface UseVideoCameraReturn {
  isRecording: boolean;
  recordingTime: number;
  initCamera: () => Promise<void>;
  resetCamera: () => void;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  setRefs: (
    videoRef: HTMLVideoElement | null,
    buttonRef: HTMLButtonElement | null,
    timerRef: HTMLDivElement | null
  ) => void;
}

/**
 * Hook for managing video camera functionality
 */
export const useVideoCamera = ({ onVideoReady, sessionId }: UseVideoCameraProps): UseVideoCameraReturn => {
  // State for recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  // Refs for DOM elements
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const timerRef = useRef<HTMLDivElement | null>(null);
  
  // Refs for recording
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
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
    try {
      console.log('Initializing camera for video recording');
      
      // First, enumerate all video devices to find the back cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      console.log('Available video devices:', videoDevices.map(d => ({
        deviceId: d.deviceId,
        groupId: d.groupId,
        label: d.label || 'Unlabeled Camera'
      })));
      
      // Start with strict constraints to force back camera with high quality
      const strictConstraints = {
        video: {
          facingMode: 'environment', // Force back camera
          width: { ideal: 1920 }, // HD width
          height: { ideal: 1080 }, // HD height
        },
        audio: true // Enable audio for video recording
      } as MediaStreamConstraints;
      
      console.log('Attempting to access back camera with strict constraints:', strictConstraints);
      
      try {
        // First try with strict constraints
        const stream = await navigator.mediaDevices.getUserMedia(strictConstraints);
        console.log('Successfully accessed back camera with strict constraints');
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        // Store the stream in the ref
        streamRef.current = stream;
        
        console.log('Camera initialized successfully with back camera');
        return; // Exit early since we successfully got the back camera
      } catch (strictError) {
        console.warn('Failed to access camera with strict constraints:', strictError);
        console.log('Falling back to less strict constraints...');
      }
      
      // Fallback to less strict constraints if the above fails
      const fallbackConstraints = {
        video: {
          facingMode: 'environment', // Prefer back camera but don't require it
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true // Enable audio for video recording
      } as MediaStreamConstraints;
      
      console.log('Requesting camera access with fallback constraints:', fallbackConstraints);
      
      const fallbackStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
      console.log('Camera access granted with fallback constraints');
      
      if (videoRef.current) {
        videoRef.current.srcObject = fallbackStream;
      }
      
      // Store the stream in the ref
      streamRef.current = fallbackStream;
      
      console.log('Camera initialized with fallback settings');
      
      // Try to identify if we got a back camera or front camera
      const videoTrack = fallbackStream.getVideoTracks()[0];
      if (videoTrack) {
        console.log('Using camera:', videoTrack.label);
        // Most devices include "back" or "rear" in the label for back cameras
        const isLikelyBackCamera = videoTrack.label.toLowerCase().includes('back') || 
                                  videoTrack.label.toLowerCase().includes('rear') ||
                                  !videoTrack.label.toLowerCase().includes('front');
        
        console.log(`Camera appears to be a ${isLikelyBackCamera ? 'back' : 'front'} camera based on label`);
        
        if (!isLikelyBackCamera) {
          console.warn('WARNING: May be using front camera instead of back camera');
          // Show a warning to the user
          alert('Warning: Your device may be using the front camera. For best results, please use the back camera.');
        }
      }
    } catch (error) {
      // Type guard for Error objects
      const err = error instanceof Error ? error : new Error(String(error));
      
      console.error('Error accessing camera:', {
        message: err.message,
        name: err.name,
        stack: err.stack
      });
      
      // Show a more detailed error message
      alert(`Unable to access camera: ${err.message}. Please ensure camera permissions are granted and try again.`);
    }
  }, []);
  
  // Reset camera
  const resetCamera = useCallback(() => {
    console.log('Resetting camera');
    
    // Stop recording if it's in progress
    if (isRecording) {
      stopRecording();
    }
    
    // Stop all tracks in the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Clear the video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
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
    
    console.log('Camera reset complete');
  }, [isRecording]);
  
  // Start recording
  const startRecording = useCallback(async () => {
    if (!streamRef.current || isRecording) {
      console.warn('Cannot start recording: stream not available or already recording');
      return;
    }
    
    try {
      console.log('Starting video recording');
      
      // Create a new MediaRecorder instance
      const options = { mimeType: 'video/webm;codecs=vp9,opus' };
      
      try {
        mediaRecorderRef.current = new MediaRecorder(streamRef.current, options);
      } catch (e) {
        console.warn('VP9 codec not supported, trying VP8:', e);
        
        // Try with VP8 codec
        const fallbackOptions = { mimeType: 'video/webm;codecs=vp8,opus' };
        
        try {
          mediaRecorderRef.current = new MediaRecorder(streamRef.current, fallbackOptions);
        } catch (e2) {
          console.warn('VP8 codec not supported, trying without codec specification:', e2);
          
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
        console.log('MediaRecorder stopped, processing video');
        
        // Create a blob from the chunks
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        console.log('Video blob created:', { size: blob.size, type: blob.type });
        
        // Call the callback with the video blob
        if (onVideoReady) {
          onVideoReady(blob);
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
      
      console.log('Recording started successfully');
    } catch (error) {
      // Type guard for Error objects
      const err = error instanceof Error ? error : new Error(String(error));
      
      console.error('Error starting recording:', {
        message: err.message,
        name: err.name,
        stack: err.stack
      });
      
      // Show a more detailed error message
      alert(`Failed to start recording: ${err.message}`);
    }
  }, [isRecording, onVideoReady]);
  
  // Stop recording
  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || !isRecording) {
      console.warn('Cannot stop recording: MediaRecorder not available or not recording');
      return;
    }
    
    try {
      console.log('Stopping video recording');
      
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
      
      console.log('Recording stopped successfully');
    } catch (error) {
      // Type guard for Error objects
      const err = error instanceof Error ? error : new Error(String(error));
      
      console.error('Error stopping recording:', {
        message: err.message,
        name: err.name,
        stack: err.stack
      });
      
      // Show a more detailed error message
      alert(`Failed to stop recording: ${err.message}`);
    }
  }, [isRecording]);
  
  return {
    isRecording,
    recordingTime,
    initCamera,
    resetCamera,
    startRecording,
    stopRecording,
    setRefs
  };
};
