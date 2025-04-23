import { FC, useRef, useEffect } from 'react';
import InstructionsModal from '../ui/InstructionsModal';

interface CameraViewProps {
  isVisible: boolean;
  imageCount: number;
  businessName?: string;
  instructionsShown: boolean;
  onInstructionsClose: () => void;
  onToggleView: () => void;
  onCaptureImage: () => Promise<void>;
  onClose?: () => void;
  onSetCameraRefs: (
    videoRef: HTMLVideoElement | null,
    flashRef: HTMLDivElement | null,
    buttonRef: HTMLButtonElement | null
  ) => void;
}

/**
 * Camera view component for capturing room images
 */
const CameraView: FC<CameraViewProps> = ({
  isVisible,
  imageCount,
  businessName,
  instructionsShown,
  onInstructionsClose,
  onToggleView,
  onCaptureImage,
  onClose,
  onSetCameraRefs
}) => {
  // Refs for DOM elements
  const cameraFeedRef = useRef<HTMLVideoElement>(null);
  const cameraOverlayRef = useRef<HTMLCanvasElement>(null);
  const cameraFlashRef = useRef<HTMLDivElement>(null);
  const captureButtonRef = useRef<HTMLButtonElement>(null);
  const captureButtonInnerRef = useRef<HTMLDivElement>(null);
  const viewToggleRef = useRef<HTMLButtonElement>(null);
  const imageCounterRef = useRef<HTMLSpanElement>(null);
  
  // Set refs for parent component
  useEffect(() => {
    onSetCameraRefs(
      cameraFeedRef.current,
      cameraFlashRef.current,
      captureButtonRef.current
    );
  }, [onSetCameraRefs]);
  
  // Update image counter display
  useEffect(() => {
    if (imageCounterRef.current) {
      imageCounterRef.current.textContent = imageCount.toString();
    }
  }, [imageCount]);
  
  return (
    <div className={`view camera-view ${isVisible ? '' : 'hidden'}`}>
      {/* Instructions Modal - only show when camera view is active and instructions haven't been shown yet */}
      {isVisible && !instructionsShown && (
        <InstructionsModal 
          onClose={onInstructionsClose} 
          businessName={businessName}
        />
      )}
      
      {/* Close button (X) - Only show when instructions modal is not visible */}
      {onClose && instructionsShown && (
        <button 
          className="close-button"
          onClick={onClose}
          aria-label="Close"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}
      
      <div className="camera-header">
        <div className="image-counter">
          Images: <span ref={imageCounterRef}>{imageCount}</span>
        </div>
      </div>
      
      <div className="camera-viewport">
        <video 
          ref={cameraFeedRef} 
          className="camera-feed" 
          autoPlay 
          playsInline
        ></video>
        <canvas 
          ref={cameraOverlayRef} 
          className="camera-overlay"
        ></canvas>
        <div 
          ref={cameraFlashRef} 
          className="camera-flash"
        ></div>
      </div>
      
      <div className="camera-controls">
        <button 
          ref={captureButtonRef} 
          className="capture-button"
          onClick={onCaptureImage}
        >
          <div 
            ref={captureButtonInnerRef} 
            className="capture-button-inner"
          ></div>
        </button>
      </div>
      
      {/* See List button in bottom right */}
      <button 
        ref={viewToggleRef} 
        className="see-list-button" 
        onClick={onToggleView}
      >
        See List
      </button>
    </div>
  );
};

export default CameraView;
