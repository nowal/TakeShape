// components/FeatureTracker.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import Script from 'next/script';

declare global {
  interface Window {
    cv: any;
  }
}

interface Point {
  x: number;
  y: number;
}

interface FeatureTrackerProps {
  onStartRecording?: () => void;
  onStopRecording?: () => void;
}

const distance = (p1: Point, p2: Point): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };
  
  const findNearestNeighbors = (point: Point, points: Point[], maxConnections: number = 3, maxDistance: number = 100): Point[] => {
    return points
      .filter(p => p !== point && distance(point, p) < maxDistance)
      .sort((a, b) => distance(point, a) - distance(point, b))
      .slice(0, maxConnections);
  };

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
  const trackedPoints = useRef<Point[]>([]);

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
          
          const video = videoRef.current;
          video.onloadedmetadata = () => {
            console.log('Video metadata loaded');
            setDebugInfo('Video metadata loaded');
            
            if (canvasRef.current && video) {
              const tracks = stream.getVideoTracks();
              const settings = tracks[0].getSettings();
              console.log('Video settings:', settings);
              
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
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [cvLoaded]);

  const processVideo = () => {
    if (!isRecordingRef.current) {
      setDebugInfo('Not recording');
      return;
    }
    
    if (!videoRef.current || !canvasRef.current || !window.cv) {
      animationFrameId.current = requestAnimationFrame(processVideo);
      return;
    }
    
    if (processingFrame.current) {
      animationFrameId.current = requestAnimationFrame(processVideo);
      return;
    }

    processingFrame.current = true;
    frameCount.current += 1;

    try {
        const cv = window.cv;
        if (!videoRef.current) throw new Error('Video element not available');
        
        const videoWidth = videoRef.current.videoWidth;
        const videoHeight = videoRef.current.videoHeight;
        
        // Create matrices
        const src = new cv.Mat(videoHeight, videoWidth, cv.CV_8UC4);
        const dst = new cv.Mat(videoHeight, videoWidth, cv.CV_8UC1);
  
        const canvasContext = canvasRef.current?.getContext('2d');
        if (!canvasContext) throw new Error('Could not get canvas context');
        
        // Draw current frame
        canvasContext.drawImage(videoRef.current, 0, 0);
        const imageData = canvasContext.getImageData(0, 0, videoWidth, videoHeight);
        src.data.set(imageData.data);
        cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
  
        // Find features
        const corners = new cv.Mat();
        const maxCorners = 100;
        const qualityLevel = 0.01;
        const minDistance = 30;
        const mask = new cv.Mat();
        const blockSize = 3;
        const useHarrisDetector = false;
        const k = 0.04;
  
        cv.goodFeaturesToTrack(
          dst,
          corners,
          maxCorners,
          qualityLevel,
          minDistance,
          mask,
          blockSize,
          useHarrisDetector,
          k
        );
  
        // Convert corners to points
        const points: Point[] = [];
        for (let i = 0; i < corners.rows; i++) {
          points.push({
            x: corners.data32F[i * 2],
            y: corners.data32F[i * 2 + 1]
          });
        }
  
        // Clear canvas and draw video frame with reduced opacity
        canvasContext.clearRect(0, 0, videoWidth, videoHeight);
        canvasContext.globalAlpha = 0.7;
        canvasContext.drawImage(videoRef.current, 0, 0);
        canvasContext.globalAlpha = 1.0;
  
        // Draw connections between points
        canvasContext.strokeStyle = 'rgba(0, 255, 0, 0.5)';
        canvasContext.lineWidth = 1;
  
        points.forEach(point => {
          const neighbors = findNearestNeighbors(point, points);
          
          neighbors.forEach(neighbor => {
            // Draw line
            canvasContext.beginPath();
            canvasContext.moveTo(point.x, point.y);
            canvasContext.lineTo(neighbor.x, neighbor.y);
            canvasContext.stroke();
  
            // Draw small circle at intersection
            canvasContext.beginPath();
            canvasContext.arc(neighbor.x, neighbor.y, 2, 0, 2 * Math.PI);
            canvasContext.fillStyle = 'rgba(255, 255, 255, 0.5)';
            canvasContext.fill();
          });
  
          // Draw feature points
          canvasContext.beginPath();
          canvasContext.arc(point.x, point.y, 3, 0, 2 * Math.PI);
          canvasContext.fillStyle = 'red';
          canvasContext.fill();
        });
  
        setDebugInfo(`Features: ${points.length}, Frame: ${frameCount.current}`);
  
        // Cleanup OpenCV objects
        src.delete();
        dst.delete();
        corners.delete();
        mask.delete();
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
    trackedPoints.current = [];
    setDebugInfo('Started recording');
    onStartRecording?.();
    requestAnimationFrame(processVideo);
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