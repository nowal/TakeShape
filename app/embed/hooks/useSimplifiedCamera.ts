'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { startSession, processFrames, getReconstruction } from '../services/directApiService';

// Settings for frame extraction
const FRAME_EXTRACTION_SETTINGS = {
  JPEG_QUALITY: 0.7, // 70% quality
  CANVAS_WIDTH: 640,
  CANVAS_HEIGHT: 480,
  FRAMES_PER_SECOND: 10, // 10 FPS
  BATCH_INTERVAL: 5000 // 5 seconds
};

interface UseSimplifiedCameraProps {
  onReconstructionUpdate?: (reconstruction: any) => void;
  onRelocalizationNeeded?: () => void;
  onRelocalizationSucceeded?: () => void;
}

interface UseSimplifiedCameraReturn {
  sessionId: string | null;
  isInitialized: boolean;
  isConnected: boolean;
  isCapturing: boolean;
  isProcessing: boolean;
  hasReconstruction: boolean;
  reconstruction: any;
  recordingTime: number;
  batchesSent: number;
  currentBatchSize: number;
  relocalizationMode: 'none' | 'needed' | 'inProgress' | 'succeeded';
  statusMessage: string;
  initCamera: () => Promise<void>;
  startCapturing: () => void;
  stopCapturing: () => Promise<void>;
  resetCamera: () => void;
  setRefs: (
    videoRef: HTMLVideoElement | null,
    buttonRef: HTMLButtonElement | null,
    timerRef: HTMLDivElement | null
  ) => void;
}

/**
 * Simplified camera hook for video capture and processing
 */
export const useSimplifiedCamera = ({
  onReconstructionUpdate,
  onRelocalizationNeeded,
  onRelocalizationSucceeded
}: UseSimplifiedCameraProps = {}): UseSimplifiedCameraReturn => {
  // State
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasReconstruction, setHasReconstruction] = useState(false);
  const [reconstruction, setReconstruction] = useState<any>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [batchesSent, setBatchesSent] = useState(0);
  const [currentBatchSize, setCurrentBatchSize] = useState(0);
  const [relocalizationMode, setRelocalizationMode] = useState<'none' | 'needed' | 'inProgress' | 'succeeded'>('none');
  const [statusMessage, setStatusMessage] = useState('Initializing camera...');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const timerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameBufferRef = useRef<string[]>([]);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const batchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Initialize session with backend
  const initSession = useCallback(async () => {
    // If we already have a session ID, just return it
    if (sessionId) {
      setIsConnected(true);
      setStatusMessage('Connected to server. Ready to capture video.');
      return sessionId;
    }
    
    // If we're already trying to connect, don't start another connection attempt
    if (isConnecting) {
      return null;
    }
    
    // Limit connection attempts to prevent overwhelming the server
    if (connectionAttempts >= 3) {
      setStatusMessage('Connection attempts exceeded. Please try again later.');
      return null;
    }
    
    try {
      setIsConnecting(true);
      setConnectionAttempts(prev => prev + 1);
      setStatusMessage(`Connecting to server (attempt ${connectionAttempts + 1}/3)...`);
      
      const newSessionId = await startSession();
      
      if (newSessionId) {
        setSessionId(newSessionId);
        setIsConnected(true);
        setIsConnecting(false);
        setStatusMessage('Connected to server. Ready to capture video.');
        return newSessionId;
      } else {
        throw new Error('No session ID returned');
      }
    } catch (error) {
      console.error('Error initializing session:', error);
      setIsConnecting(false);
      setStatusMessage('Failed to connect to server. Please try again.');
      return null;
    }
  }, [sessionId, isConnecting, connectionAttempts]);

  // Initialize camera
  const initCamera = useCallback(async () => {
    // If already initialized and stream is active, just return
    if (isInitialized && streamRef.current && videoRef.current && videoRef.current.srcObject) {
      // If we already have a session ID, just update the status message
      if (sessionId) {
        setStatusMessage('Connected to server. Ready to capture video.');
        return;
      }
    }

    try {
      setStatusMessage('Initializing camera...');

      // Create a canvas for frame extraction if it doesn't exist
      if (!canvasRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = FRAME_EXTRACTION_SETTINGS.CANVAS_WIDTH;
        canvas.height = FRAME_EXTRACTION_SETTINGS.CANVAS_HEIGHT;
        canvasRef.current = canvas;
      }

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
        audio: false // No audio needed
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
          audio: false // No audio needed
        } as MediaStreamConstraints;

        const fallbackStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);

        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
        }

        // Store the stream in the ref
        streamRef.current = fallbackStream;
      }

      // Update state
      setIsInitialized(true);
      
      // Only try to initialize a session if we don't already have one
      if (!sessionId && !isConnecting) {
        setStatusMessage('Camera initialized. Connecting to server...');
        await initSession();
      } else if (sessionId) {
        setStatusMessage('Connected to server. Ready to capture video.');
      } else {
        setStatusMessage('Waiting for server connection...');
      }

    } catch (error) {
      console.error('Error accessing camera:', error);
      setStatusMessage('Failed to access camera. Please ensure camera permissions are granted and try again.');
    }
  }, [isInitialized, initSession, sessionId, isConnecting]);

  // Capture a single frame
  const captureFrame = useCallback((): string | null => {
    // Check if video and canvas refs exist
    if (!videoRef.current) {
      console.error('Cannot capture frame: video ref is null');
      return null;
    }
    
    if (!canvasRef.current) {
      console.error('Cannot capture frame: canvas ref is null');
      // Create a canvas if it doesn't exist
      const canvas = document.createElement('canvas');
      canvas.width = FRAME_EXTRACTION_SETTINGS.CANVAS_WIDTH;
      canvas.height = FRAME_EXTRACTION_SETTINGS.CANVAS_HEIGHT;
      canvasRef.current = canvas;
      console.log('Created new canvas for frame capture');
    }

    // Check if video has loaded and has dimensions
    if (!videoRef.current.videoWidth || !videoRef.current.videoHeight) {
      console.error('Cannot capture frame: video dimensions are not available yet');
      console.log('Video element state:', {
        readyState: videoRef.current.readyState,
        networkState: videoRef.current.networkState,
        error: videoRef.current.error,
        srcObject: videoRef.current.srcObject ? 'exists' : 'null'
      });
      
      // Try to force play the video
      if (videoRef.current.paused) {
        videoRef.current.play().catch(e => console.error('Failed to play video during capture check:', e));
      }
      
      return null;
    }

    try {
      // Create a new canvas for each frame to avoid any potential issues with reusing the same canvas
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = FRAME_EXTRACTION_SETTINGS.CANVAS_WIDTH;
      tempCanvas.height = FRAME_EXTRACTION_SETTINGS.CANVAS_HEIGHT;
      
      const context = tempCanvas.getContext('2d', { alpha: false }); // Disable alpha for better performance
      if (!context) {
        console.error('Cannot capture frame: failed to get canvas context');
        return null;
      }

      // Ensure video is playing and has dimensions
      if (videoRef.current.paused || videoRef.current.ended) {
        console.error('Cannot capture frame: video is paused or ended');
        // Try to play the video
        videoRef.current.play().catch(e => console.error('Failed to play video during capture:', e));
        return null;
      }

      // Log video dimensions for debugging
      console.log(`Video dimensions: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
      console.log(`Canvas dimensions: ${tempCanvas.width}x${tempCanvas.height}`);

      // Set background to white to ensure we have data
      context.fillStyle = '#FFFFFF';
      context.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Draw the current video frame to the canvas
      try {
        context.drawImage(
          videoRef.current,
          0, 0,
          tempCanvas.width,
          tempCanvas.height
        );
        
        // Check if the canvas has data by getting a pixel
        const pixel = context.getImageData(
          tempCanvas.width / 2, 
          tempCanvas.height / 2, 
          1, 1
        );
        
        // Log pixel data for debugging
        console.log('Center pixel data:', Array.from(pixel.data));
        
        // Check if the pixel is completely transparent or black
        if (pixel.data[3] === 0 || (pixel.data[0] === 0 && pixel.data[1] === 0 && pixel.data[2] === 0)) {
          console.error('Canvas appears to be empty or black after drawing');
          
          // Try a different approach - draw a colored rectangle first
          context.fillStyle = 'red';
          context.fillRect(0, 0, 50, 50);
          
          // Then try to draw the video frame again
          context.drawImage(
            videoRef.current,
            0, 0,
            tempCanvas.width,
            tempCanvas.height
          );
        }
        
      } catch (drawError) {
        console.error('Error drawing video to canvas:', drawError);
        return null;
      }

      // Convert the canvas to a data URL
      const frameData = tempCanvas.toDataURL(
        'image/jpeg',
        FRAME_EXTRACTION_SETTINGS.JPEG_QUALITY
      );

      // Validate the frame data
      if (!frameData || frameData === 'data:,') {
        console.error('Failed to get valid frame data from canvas');
        return null;
      }

      // Log frame capture success
      console.log(`Frame captured successfully: ${frameData.length} bytes`);
      
      // For the first frame, log more details
      if (frameBufferRef.current.length === 0) {
        console.log(`First frame data preview: ${frameData.substring(0, 100)}...`);
      }

      return frameData;
    } catch (error) {
      console.error('Error capturing frame:', error);
      return null;
    }
  }, []);

  // Send current batch of frames
  const sendCurrentBatch = useCallback(async () => {
    if (!sessionId || frameBufferRef.current.length === 0) {
      return;
    }

    // Make a copy of the current frames
    const framesToSend = [...frameBufferRef.current];

    // Clear the buffer
    frameBufferRef.current = [];
    setCurrentBatchSize(0);

    console.log(`Sending batch of ${framesToSend.length} frames`);
    setIsProcessing(true);

    try {
      // Send the frames
      const result = await processFrames(sessionId, framesToSend);
      setBatchesSent(prev => prev + 1);

      // Handle relocalization
      if (result.relocalization_needed) {
        setRelocalizationMode('needed');
        setStatusMessage('Lost overlap. Please go back to last successful area.');
        if (onRelocalizationNeeded) {
          onRelocalizationNeeded();
        }
      } else if (result.relocalization_successful) {
        setRelocalizationMode('succeeded');
        setStatusMessage('Successfully relocalized! Please continue scanning.');
        if (onRelocalizationSucceeded) {
          onRelocalizationSucceeded();
        }
      } else if (result.in_relocalization_mode) {
        setRelocalizationMode('inProgress');
        setStatusMessage('Relocalizing... Please scan areas you\'ve already captured.');
      }

      // Handle reconstruction
      if (result.reconstruction) {
        setReconstruction(result.reconstruction);
        setHasReconstruction(true);
        if (onReconstructionUpdate) {
          onReconstructionUpdate(result.reconstruction);
        }
      }

      setIsProcessing(false);
    } catch (error) {
      console.error('Error sending frame batch:', error);
      setIsProcessing(false);
      setStatusMessage('Error processing frames. Please try again.');
    }
  }, [sessionId, onReconstructionUpdate, onRelocalizationNeeded, onRelocalizationSucceeded]);

  // Start capturing frames
  const startCapturing = useCallback(() => {
    if (!isInitialized || !streamRef.current) {
      console.error('Cannot start capturing: camera not initialized');
      setStatusMessage('Camera not initialized. Please refresh the page.');
      return;
    }

    if (isCapturing) {
      console.warn('Already capturing frames');
      return;
    }

    // Ensure we have a session ID before starting to capture
    if (!sessionId) {
      console.error('Cannot start capturing: no session ID');
      setStatusMessage('Session ID required. Please refresh the page.');
      return;
    }

    // Ensure video element is ready
    if (!videoRef.current || !videoRef.current.srcObject) {
      console.error('Cannot start capturing: video element not ready');
      setStatusMessage('Video not ready. Please refresh the page.');
      return;
    }

    // Ensure video is playing
    if (videoRef.current.paused) {
      console.log('Video is paused, attempting to play...');
      try {
        // Use a synchronous approach to play the video
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            console.error('Failed to play video:', e);
            // Try again with user interaction simulation
            document.addEventListener('click', function playOnClick() {
              videoRef.current?.play().catch(err => console.error('Still failed to play:', err));
              document.removeEventListener('click', playOnClick);
            }, { once: true });
          });
        }
      } catch (e) {
        console.error('Error playing video:', e);
      }
    }

    console.log('Starting frame capturing with session ID:', sessionId);
    setStatusMessage('Capturing video...');

    // Force state update and ensure it's reflected immediately
    setIsCapturing(true);
    
    // Use a ref to track capturing state as well (for more reliable access)
    const isCapturingRef = { current: true };
    
    // Direct DOM manipulation to ensure UI updates
    if (buttonRef.current) {
      console.log('Updating button to recording state');
      buttonRef.current.classList.add('recording');
      buttonRef.current.textContent = 'Stop';
    } else {
      console.warn('Button ref is null, cannot update UI');
    }

    if (timerRef.current) {
      console.log('Making timer visible');
      timerRef.current.classList.add('visible');
    } else {
      console.warn('Timer ref is null, cannot update UI');
    }

    // Reset recording time
    setRecordingTime(0);
    let localRecordingTime = 0;

    // Start timer with more reliable approach
    console.log('Starting recording timer');
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    
    recordingIntervalRef.current = setInterval(() => {
      localRecordingTime += 1;
      console.log(`Recording time: ${localRecordingTime}s`);
      setRecordingTime(localRecordingTime);
      
      // Update timer display directly
      if (timerRef.current) {
        const minutes = Math.floor(localRecordingTime / 60);
        const seconds = (localRecordingTime % 60).toString().padStart(2, '0');
        timerRef.current.textContent = `${minutes}:${seconds}`;
      }
    }, 1000);

    // Calculate capture interval based on FPS
    const captureIntervalMs = Math.floor(1000 / FRAME_EXTRACTION_SETTINGS.FRAMES_PER_SECOND);
    console.log(`Setting capture interval to ${captureIntervalMs}ms (${FRAME_EXTRACTION_SETTINGS.FRAMES_PER_SECOND} FPS)`);

    // Clear any existing intervals
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
    }
    
    // Start capturing frames at regular intervals
    captureIntervalRef.current = setInterval(() => {
      // Double-check we're still capturing
      if (!isCapturingRef.current) {
        console.log('Capture interval called but no longer capturing, clearing interval');
        if (captureIntervalRef.current) {
          clearInterval(captureIntervalRef.current);
          captureIntervalRef.current = null;
        }
        return;
      }
      
      try {
        // Force play the video if it's paused
        if (videoRef.current && videoRef.current.paused) {
          videoRef.current.play().catch(e => console.warn('Could not play video in capture interval:', e));
        }
        
        const frame = captureFrame();
        if (frame) {
          frameBufferRef.current.push(frame);
          const newSize = frameBufferRef.current.length;
          setCurrentBatchSize(newSize);
          console.log(`Frame captured. Buffer size: ${newSize}`);
        } else {
          console.warn('Failed to capture frame, skipping this frame');
        }
      } catch (error) {
        console.error('Error in capture interval:', error);
      }
    }, captureIntervalMs);

    // Clear any existing batch intervals
    if (batchIntervalRef.current) {
      clearInterval(batchIntervalRef.current);
    }
    
    // Start batch interval to send frames every batchInterval ms
    console.log(`Setting batch interval to ${FRAME_EXTRACTION_SETTINGS.BATCH_INTERVAL}ms`);
    batchIntervalRef.current = setInterval(() => {
      // Double-check we're still capturing
      if (!isCapturingRef.current) {
        console.log('Batch interval called but no longer capturing, clearing interval');
        if (batchIntervalRef.current) {
          clearInterval(batchIntervalRef.current);
          batchIntervalRef.current = null;
        }
        return;
      }
      
      try {
        if (frameBufferRef.current.length > 0) {
          console.log(`Sending batch of ${frameBufferRef.current.length} frames`);
          sendCurrentBatch();
        } else {
          console.warn('No frames to send in this batch');
        }
      } catch (error) {
        console.error('Error in batch interval:', error);
      }
    }, FRAME_EXTRACTION_SETTINGS.BATCH_INTERVAL);

    // Return the capturing ref for external access
    return isCapturingRef;
  }, [isInitialized, isCapturing, captureFrame, sendCurrentBatch, sessionId]);

  // Stop capturing frames
  const stopCapturing = useCallback(async () => {
    if (!isCapturing) {
      console.warn('Not capturing frames');
      return;
    }

    console.log('Stopping frame capturing');
    setStatusMessage('Processing captured video...');

    // Set capturing state
    setIsCapturing(false);

    // Remove recording class from button if it exists
    if (buttonRef.current) {
      buttonRef.current.classList.remove('recording');
      // Ensure the button text is updated
      if (buttonRef.current.textContent !== 'Start') {
        buttonRef.current.textContent = 'Start';
      }
    }

    // Hide timer if it exists
    if (timerRef.current) {
      timerRef.current.classList.remove('visible');
    }

    // Clear intervals
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }

    if (batchIntervalRef.current) {
      clearInterval(batchIntervalRef.current);
      batchIntervalRef.current = null;
    }

    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }

    try {
      // Log the number of frames in the buffer
      console.log(`Sending final batch of ${frameBufferRef.current.length} frames`);
      
      // Send any remaining frames
      if (frameBufferRef.current.length > 0) {
        await sendCurrentBatch();
      } else {
        console.log('No frames to send in final batch');
      }
    } catch (error) {
      console.error('Error sending final batch:', error);
      setStatusMessage('Error processing final frames. The model may be incomplete.');
    }

  }, [isCapturing, sendCurrentBatch]);

  // Reset camera
  const resetCamera = useCallback(() => {
    // Stop capturing if active
    if (isCapturing) {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
        captureIntervalRef.current = null;
      }

      if (batchIntervalRef.current) {
        clearInterval(batchIntervalRef.current);
        batchIntervalRef.current = null;
      }

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
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

    // Clear polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    // Reset state
    setIsInitialized(false);
    setIsCapturing(false);
    setIsProcessing(false);
    setRecordingTime(0);
    setCurrentBatchSize(0);
    setIsConnecting(false);
    setConnectionAttempts(0);
    frameBufferRef.current = [];

  }, [isCapturing]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      resetCamera();
    };
  }, [resetCamera]);

  return {
    sessionId,
    isInitialized,
    isConnected,
    isCapturing,
    isProcessing,
    hasReconstruction,
    reconstruction,
    recordingTime,
    batchesSent,
    currentBatchSize,
    relocalizationMode,
    statusMessage,
    initCamera,
    startCapturing,
    stopCapturing,
    resetCamera,
    setRefs
  };
};
