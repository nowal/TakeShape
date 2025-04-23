import { useState, useRef, useEffect } from 'react';
import { resizeAndCompressImage } from '@/utils/imageProcessing';

// Number of images required before processing
const REQUIRED_IMAGES_COUNT = 4;

interface UseCameraProps {
  onImagesReady: (images: Blob[]) => void;
  sessionId?: string | null;
}

interface UseCameraReturn {
  stream: MediaStream | null;
  imageCount: number;
  captureImage: () => Promise<void>;
  initCamera: () => Promise<void>;
  pendingImages: Blob[];
  resetCamera: () => void;
  setRefs: (
    videoRef: HTMLVideoElement | null,
    flashRef: HTMLDivElement | null,
    buttonRef: HTMLButtonElement | null
  ) => void;
}

/**
 * Hook for managing camera functionality
 */
export const useCamera = ({ onImagesReady, sessionId }: UseCameraProps): UseCameraReturn => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [imageCount, setImageCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  
  // Create a ref to store pending images
  const pendingImagesRef = useRef<Blob[]>([]);
  
  // Refs for DOM elements
  const cameraFeedRef = useRef<HTMLVideoElement | null>(null);
  const cameraFlashRef = useRef<HTMLDivElement | null>(null);
  const captureButtonRef = useRef<HTMLButtonElement | null>(null);
  
  // Set refs from outside
  const setRefs = (
    videoRef: HTMLVideoElement | null,
    flashRef: HTMLDivElement | null,
    buttonRef: HTMLButtonElement | null
  ) => {
    cameraFeedRef.current = videoRef;
    cameraFlashRef.current = flashRef;
    captureButtonRef.current = buttonRef;
  };
  
  // Initialize camera
  const initCamera = async () => {
    // If camera is already initialized or initializing, don't initialize again
    if ((isInitialized && stream) || isInitializing) {
      console.log('Camera already initialized or initializing, skipping initialization');
      return;
    }
    
    // Set initializing flag
    setIsInitializing(true);
    
    // Clean up any existing stream before initializing a new one
    if (stream) {
      console.log('Stopping existing camera stream before initializing a new one');
      stream.getTracks().forEach(track => {
        track.stop();
      });
      setStream(null);
      
      // If there's a video element, clear its source
      if (cameraFeedRef.current) {
        cameraFeedRef.current.srcObject = null;
      }
    }
    
    try {
      console.log('Initializing camera with environment facing mode and widest possible view');
      
      // First, enumerate all video devices to find the back cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      console.log('Available video devices:', videoDevices.map(d => ({
        deviceId: d.deviceId,
        groupId: d.groupId,
        label: d.label || 'Unlabeled Camera'
      })));
      
      // Start with strict constraints to force back camera
      const strictConstraints = {
        video: {
          facingMode: 'environment', // Force back camera
          width: { ideal: 4032 }, // Request maximum width
          height: { ideal: 3024 }, // Request maximum height
        }
      } as MediaStreamConstraints;
      
      console.log('Attempting to access back camera with strict constraints:', strictConstraints);
      
      try {
        // First try with strict constraints
        const cameraStream = await navigator.mediaDevices.getUserMedia(strictConstraints);
        console.log('Successfully accessed back camera with strict constraints');
        
        if (cameraFeedRef.current) {
          cameraFeedRef.current.srcObject = cameraStream;
        }
        
        // Try to set the zoom to minimum (widest view)
        const videoTrack = cameraStream.getVideoTracks()[0];
        if (videoTrack) {
          console.log('Video track info:', {
            label: videoTrack.label,
            id: videoTrack.id,
            kind: videoTrack.kind,
            enabled: videoTrack.enabled,
            muted: videoTrack.muted,
          });
          
          // Log detailed capabilities
          if ('getCapabilities' in videoTrack) {
            const capabilities = videoTrack.getCapabilities();
            console.log('Camera capabilities:', capabilities);
            
            // If zoom is supported, set it to the minimum value (widest field of view)
            const capabilitiesAny = capabilities as any;
            if (capabilitiesAny.zoom) {
              console.log(`Setting zoom to minimum value: ${capabilitiesAny.zoom.min}`);
              
              try {
                // Use type assertion to handle non-standard properties
                await videoTrack.applyConstraints({
                  advanced: [{ zoom: capabilitiesAny.zoom.min } as any]
                } as MediaTrackConstraints);
                
                console.log('Successfully set minimum zoom');
              } catch (zoomError) {
                console.error('Error setting zoom:', zoomError);
              }
            } else {
              console.log('Camera does not support zoom capability');
            }
            
            // If we have a wide-angle camera option, try to use it
            if (capabilitiesAny.facingMode && 
                Array.isArray(capabilitiesAny.facingMode) && 
                capabilitiesAny.facingMode.includes('environment-ultra-wide')) {
              console.log('Ultra-wide back camera detected, attempting to use it');
              
              try {
                await videoTrack.applyConstraints({
                  facingMode: 'environment-ultra-wide'
                } as MediaTrackConstraints);
                
                console.log('Successfully switched to ultra-wide camera');
              } catch (ultraWideError) {
                console.error('Error switching to ultra-wide camera:', ultraWideError);
              }
            }
          } else {
            console.log('getCapabilities not supported on this device/browser');
          }
        }
        
        // Update state with the stream
        setStream(cameraStream);
        setIsInitialized(true);
        
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
        }
      } as MediaStreamConstraints;
      
      console.log('Requesting camera access with fallback constraints:', fallbackConstraints);
      
      const fallbackStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
      console.log('Camera access granted with fallback constraints');
      
      if (cameraFeedRef.current) {
        cameraFeedRef.current.srcObject = fallbackStream;
      }
      
      // Update state with the fallback stream
      setStream(fallbackStream);
      setIsInitialized(true);
      
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
    } finally {
      // Clear initializing flag regardless of success or failure
      setIsInitializing(false);
    }
  };

  // Capture image from camera
  const captureImage = async () => {
    console.log('Capture image function called');
    
    if (!cameraFeedRef.current || !sessionId) {
      console.error('Missing required refs or sessionId:', {
        cameraFeedRef: !!cameraFeedRef.current,
        sessionId
      });
      return;
    }
    
    // Trigger camera flash animation
    if (cameraFlashRef.current) {
      // Add the flash animation class
      cameraFlashRef.current.classList.add('flash-animation');
      
      // Remove the class after animation completes
      setTimeout(() => {
        if (cameraFlashRef.current) {
          cameraFlashRef.current.classList.remove('flash-animation');
        }
      }, 300); // Match the animation duration in CSS
    }
    
    // Add button press animation
    if (captureButtonRef.current) {
      captureButtonRef.current.style.transform = 'scale(0.95)';
      setTimeout(() => {
        if (captureButtonRef.current) {
          captureButtonRef.current.style.transform = 'scale(1)';
        }
      }, 150);
    }
    
    // Create an offscreen canvas to avoid interrupting the video stream
    const offscreenCanvas = document.createElement('canvas');
    const video = cameraFeedRef.current;
    const context = offscreenCanvas.getContext('2d');
    
    if (!context) {
      console.error('Failed to get canvas context');
      return;
    }
    
    console.log('Setting canvas dimensions', {
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight
    });
    
    // Set canvas dimensions to match video
    offscreenCanvas.width = video.videoWidth;
    offscreenCanvas.height = video.videoHeight;
    
    // Draw the video frame to the offscreen canvas
    context.drawImage(video, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
    console.log('Drew video frame to offscreen canvas');
    
    // Convert canvas to blob
    console.log('Converting canvas to blob...');
    offscreenCanvas.toBlob(async (originalBlob) => {
      if (!originalBlob) {
        console.error('Failed to capture image - blob is null');
        return;
      }
      
      console.log('Original blob created successfully', {
        size: originalBlob.size,
        type: originalBlob.type
      });
      
      try {
        // Resize and compress the image to reduce file size
        console.log('Resizing and compressing image...');
        const processedBlob = await resizeAndCompressImage(
          originalBlob,
          1024, // Max width
          768,  // Max height
          0.8   // JPEG quality (0-1)
        );
        
        console.log('Image processed successfully', {
          originalSize: originalBlob.size,
          processedSize: processedBlob.size,
          reduction: `${Math.round((1 - processedBlob.size / originalBlob.size) * 100)}%`
        });
        
        // Store the processed blob locally
        pendingImagesRef.current.push(processedBlob);
        
        // Update image count
        setImageCount(prevCount => prevCount + 1);
        
        // Check if we have enough images to process
        if (pendingImagesRef.current.length >= REQUIRED_IMAGES_COUNT) {
          // Automatically process images when we reach the required count
          console.log('Required image count reached, processing automatically');
          // Use requestAnimationFrame instead of setTimeout to avoid race conditions
          requestAnimationFrame(() => {
            onImagesReady(pendingImagesRef.current);
          });
        }
      } catch (error) {
        console.error('Error processing image:', error);
        alert('Failed to process image. Please try again.');
      }
    }, 'image/jpeg', 0.95);
  };

  // Reset camera state
  const resetCamera = () => {
    pendingImagesRef.current = [];
    setImageCount(0);
    setIsInitialized(false);
    
    // Also stop any existing stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      
      // If there's a video element, clear its source
      if (cameraFeedRef.current) {
        cameraFeedRef.current.srcObject = null;
      }
    }
  };

  // Cleanup function
  useEffect(() => {
    return () => {
      // Stop camera stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return {
    stream,
    imageCount,
    captureImage,
    initCamera,
    pendingImages: pendingImagesRef.current,
    resetCamera,
    setRefs
  };
};
