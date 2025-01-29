// components/FeatureTracker.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import Script from 'next/script';

declare global {
  interface Window {
    cv: any;
  }
}

interface FeatureTrackerProps {
  onStartRecording?: () => void;
  onStopRecording?: () => void;
}

const FeatureTracker: React.FC<FeatureTrackerProps> = ({
  onStartRecording,
  onStopRecording,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isRecordingRef = useRef<boolean>(false);
  const [isRecording, setIsRecording] = useState(false);
  const [cvLoaded, setCvLoaded] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('Initializing...');
  const processingFrame = useRef(false);
  const frameCount = useRef(0);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const setupCamera = async () => {
      try {
        console.log('Setting up camera...');
        setDebugInfo('Setting up camera...');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // Wait for video metadata to load
          const video = videoRef.current;
          video.onloadedmetadata = () => {
            console.log('Video metadata loaded');
            setDebugInfo('Video metadata loaded');
            
            // Set canvas size to match video
            if (canvasRef.current && video) {
              const tracks = stream.getVideoTracks();
              const settings = tracks[0].getSettings();
              console.log('Video settings:', settings);
              
              // Use actual video dimensions from stream
              canvasRef.current.width = settings.width || 1280;
              canvasRef.current.height = settings.height || 720;
              console.log(`Canvas size set to ${canvasRef.current.width}x${canvasRef.current.height}`);
            }
            
            video.onloadeddata = () => {
              console.log('Video data loaded');
              setDebugInfo('Camera ready - video data loaded');
              video.play();
            };
          };
        }
      } catch (err: unknown) {
        console.error('Error accessing camera:', err);
        setDebugInfo(`Camera error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    if (cvLoaded) {
      console.log('OpenCV loaded, setting up camera...');
      setupCamera();
    }

    return () => {
      // Cleanup on unmount
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [cvLoaded]);

  const processVideo = () => {
    console.log('Processing video frame...');
    
    // Check each condition separately
    if (!isRecordingRef.current) {
      console.log('Not recording, skipping frame');
      setDebugInfo('Skipping frame - not recording');
      return;
    }
    if (!videoRef.current) {
      console.log('No video element');
      setDebugInfo('Skipping frame - no video element');
      return;
    }
    if (!canvasRef.current) {
      console.log('No canvas element');
      setDebugInfo('Skipping frame - no canvas element');
      return;
    }
    if (!window.cv) {
      console.log('OpenCV not loaded');
      setDebugInfo('Skipping frame - OpenCV not loaded');
      return;
    }
    
    // Additional checks for video readiness
    if (!videoRef.current.videoWidth || !videoRef.current.videoHeight) {
      console.log('Video dimensions not ready');
      setDebugInfo('Skipping frame - video dimensions not ready');
      return;
    }
    
    if (videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      console.log('Waiting for video data');
      setDebugInfo('Skipping frame - waiting for video data');
      return;
    }

    if (processingFrame.current) {
      console.log('Still processing previous frame');
      animationFrameId.current = requestAnimationFrame(processVideo);
      return;
    }

    processingFrame.current = true;
    frameCount.current += 1;
    console.log('Processing frame:', frameCount.current);

    try {
      const cv = window.cv;
      
      // Null check for videoRef
      if (!videoRef.current) throw new Error('Video element not available');
      
      // Get the actual video dimensions
      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;
      
      console.log(`Processing frame with dimensions: ${videoWidth}x${videoHeight}`);
      
      // Create source and output matrices with correct dimensions
      const src = new cv.Mat(videoHeight, videoWidth, cv.CV_8UC4);
      const dst = new cv.Mat(videoHeight, videoWidth, cv.CV_8UC1);

      // Get video frame data
      const canvasContext = canvasRef.current?.getContext('2d');
      if (!canvasContext) throw new Error('Could not get canvas context');
      
      // Draw the current video frame to the canvas
      canvasContext.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);
      
      // Get the frame data from the canvas
      const imageData = canvasContext.getImageData(0, 0, videoWidth, videoHeight);
      src.data.set(imageData.data);

      // Convert to grayscale
      cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);

      // Find features
      const corners = new cv.Mat();
      const maxCorners = 50;
      const qualityLevel = 0.01;
      const minDistance = 10;
      const none = new cv.Mat();

      cv.goodFeaturesToTrack(
        dst,
        corners,
        maxCorners,
        qualityLevel,
        minDistance,
        none
      );

      // Clear canvas
      canvasContext.clearRect(0, 0, canvasRef.current?.width || 0, canvasRef.current?.height || 0);

      // Draw feature points
      for (let i = 0; i < corners.rows; i++) {
        const x = corners.data32F[i * 2];
        const y = corners.data32F[i * 2 + 1];

        canvasContext.beginPath();
        canvasContext.arc(x, y, 3, 0, 2 * Math.PI);
        canvasContext.fillStyle = 'red';
        canvasContext.fill();
      }

      console.log(`Found ${corners.rows} features`);
      setDebugInfo(`Processing frame ${frameCount.current}, found ${corners.rows} features`);

      // Cleanup
      src.delete();
      dst.delete();
      corners.delete();
      none.delete();
    } catch (err: unknown) {
      console.error('Error processing frame:', err);
      setDebugInfo(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    processingFrame.current = false;
    animationFrameId.current = requestAnimationFrame(processVideo);
  };

  const handleStartRecording = () => {
    console.log('Starting recording...');
    isRecordingRef.current = true;
    setIsRecording(true);
    frameCount.current = 0;
    setDebugInfo('Started recording');
    onStartRecording?.();
    animationFrameId.current = requestAnimationFrame(processVideo);
  };

  const handleStopRecording = () => {
    console.log('Stopping recording...');
    isRecordingRef.current = false;
    setIsRecording(false);
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    setDebugInfo('Stopped recording');
    onStopRecording?.();
  };

  return (
    <>
      <Script 
        src="https://docs.opencv.org/4.8.0/opencv.js"
        onLoad={() => {
          console.log('OpenCV script loaded');
          setCvLoaded(true);
          setDebugInfo('OpenCV loaded');
        }}
        onError={(e) => {
          console.error('OpenCV script failed to load:', e);
          setDebugInfo('Failed to load OpenCV');
        }}
      />
      <div className="relative w-full h-full bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          width={1280}
          height={720}
        />
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            className="bg-red-600 text-white p-4 rounded-full flex items-center justify-center"
            type="button"
            disabled={!cvLoaded}
          >
            <Camera className={isRecording ? 'animate-pulse' : ''} size={24} />
          </button>
        </div>
        <div className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded text-sm font-mono">
          {debugInfo}
        </div>
      </div>
    </>
  );
};

export default FeatureTracker;