import { useState, useEffect, FC } from 'react';
import { Camera } from 'lucide-react';

// WebXR Type Definitions
declare global {
  interface XRSystem {
    isSessionSupported(mode: string): Promise<boolean>;
    requestSession(mode: string, options?: XRSessionInit): Promise<XRSession>;
  }

  interface XRSessionInit {
    requiredFeatures?: string[];
    optionalFeatures?: string[];
    domOverlay?: { root: HTMLElement };
  }

  interface XRSession {
    requestReferenceSpace(type: string): Promise<XRReferenceSpace>;
    requestAnimationFrame(callback: XRFrameRequestCallback): number;
    end(): Promise<void>;
  }

  interface XRFrame {
    getViewerPose(referenceSpace: XRReferenceSpace): XRViewerPose | null;
  }

  interface XRReferenceSpace {
    // Base reference space interface
  }

  interface XRViewerPose {
    transform: {
      position: { x: number; y: number; z: number };
      orientation: { x: number; y: number; z: number; w: number };
    };
    views: XRView[];
  }

  interface XRView {
    transform: {
      matrix: Float32Array;
    };
  }

  type XRFrameRequestCallback = (time: number, frame: XRFrame) => void;

  interface Navigator {
    xr?: XRSystem;
  }
}

// Component Types
export interface PoseData {
  timestamp: number;
  position: {
    x: number;
    y: number;
    z: number;
  };
  orientation: {
    x: number;
    y: number;
    z: number;
    w: number;
  };
  viewMatrix: Float32Array;
}

type ARCaptureProps = {
  onCapture: (file: File, poseData: PoseData[]) => void;
  isRecording?: boolean;
};

export const ARCapture: FC<ARCaptureProps> = ({ onCapture, isRecording }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [arSession, setArSession] = useState<XRSession | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [poseData, setPoseData] = useState<PoseData[]>([]);

  useEffect(() => {
    // Check if WebXR is supported
    const checkSupport = async () => {
      if (typeof navigator !== 'undefined' && navigator.xr) {
        try {
          const supported = await navigator.xr.isSessionSupported('immersive-ar');
          setIsSupported(supported);
        } catch (error) {
          console.error('Error checking WebXR support:', error);
          setIsSupported(false);
        }
      }
    };
    checkSupport();
  }, []);

  const startRecording = async () => {
    if (!navigator.xr) return;

    try {
      // Start AR session
      const session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['local-floor'],
        optionalFeatures: ['dom-overlay'],
        domOverlay: { root: document.body }
      });
      setArSession(session);

      // Set up video recording
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };
      
      // Start recording
      recorder.start(100);
      setMediaRecorder(recorder);

      // Set up pose tracking
      const onFrame: XRFrameRequestCallback = async (time, frame) => {
        const referenceSpace = await session.requestReferenceSpace('local-floor');
        const pose = frame.getViewerPose(referenceSpace);
        
        if (pose) {
          setPoseData(prev => [...prev, {
            timestamp: performance.now(),
            position: pose.transform.position,
            orientation: pose.transform.orientation,
            viewMatrix: pose.views[0].transform.matrix
          }]);
        }
        
        session.requestAnimationFrame(onFrame);
      };
      
      session.requestAnimationFrame(onFrame);
    } catch (error) {
      console.error('Failed to start AR capture:', error);
    }
  };

  const stopRecording = async () => {
    if (mediaRecorder && arSession) {
      mediaRecorder.stop();
      await arSession.end();
      
      // Create video file from chunks
      const videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
      const videoFile = new File([videoBlob], 'ar-capture.webm', { type: 'video/webm' });
      
      // Pass video and pose data to parent
      onCapture(videoFile, poseData);
      
      // Reset state
      setArSession(null);
      setMediaRecorder(null);
      setRecordedChunks([]);
      setPoseData([]);
    }
  };

  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else if (isRecording === false) {
      stopRecording();
    }
  }, [isRecording]);

  if (!isSupported) return null;

  return (
    <div className="flex items-center gap-2 text-current">
      <Camera className="h-5 w-5" />
      <span>AR Capture Available</span>
    </div>
  );
};