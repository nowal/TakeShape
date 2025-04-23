import { FC, useRef, useEffect, useState } from 'react';
import { Room } from '@/app/demo/types';
import RoomDropdown from '../ui/RoomDropdown';
import LoadingIndicator from '../ui/LoadingIndicator';
import ConfirmationModal from '../ui/ConfirmationModal';

interface RoomListViewProps {
  isVisible: boolean;
  rooms: Record<string, Room>;
  temporaryRooms: Record<string, Room>;
  activeRoom: string | null;
  classifiedRoomNames: Record<string, string>;
  processingRoom: string | null;
  isProcessingAnyRoom: boolean;
  primaryColor?: string;
  onRoomSelect: (roomId: string) => void;
  onRoomNameChange: (roomId: string, name: string) => void;
  onRoomNameSave: (roomId: string, name: string) => Promise<void>;
  onToggleView: () => void;
  onGenerateQuote: () => void;
  onClose?: () => void;
  onSetRefs: (
    modelViewerRef: HTMLDivElement | null,
    loadingIndicatorRef: HTMLDivElement | null
  ) => void;
}

/**
 * Room list view component for displaying and managing rooms
 */
const RoomListView: FC<RoomListViewProps> = ({
  isVisible,
  rooms,
  temporaryRooms,
  activeRoom,
  classifiedRoomNames,
  processingRoom,
  isProcessingAnyRoom,
  primaryColor,
  onRoomSelect,
  onRoomNameChange,
  onRoomNameSave,
  onToggleView,
  onGenerateQuote,
  onClose,
  onSetRefs
}) => {
  // Refs for DOM elements
  const modelViewerRef = useRef<HTMLDivElement>(null);
  const loadingIndicatorRef = useRef<HTMLDivElement>(null);
  const cameraButtonRef = useRef<HTMLButtonElement>(null);
  
  // Set refs for parent component
  useEffect(() => {
    onSetRefs(
      modelViewerRef.current,
      loadingIndicatorRef.current
    );
  }, [onSetRefs]);
  
  // Handle active input field change
  const handleActiveInputFieldChange = (roomId: string | null, element: HTMLInputElement | null) => {
    // This function can be used to track which input field is currently active
    // For example, to prevent closing the dropdown when clicking on an input
    console.log('Active input field changed:', roomId);
  };
  
  // State to control the confirmation modal visibility
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  
  // Handle the submit button click
  const handleSubmitClick = () => {
    setShowConfirmationModal(true);
  };
  
  // Handle confirmation in the modal
  const handleConfirmSubmit = () => {
    setShowConfirmationModal(false);
    onGenerateQuote();
  };
  
  // Handle closing the confirmation modal
  const handleCloseConfirmation = () => {
    setShowConfirmationModal(false);
  };
  
  return (
    <div className={`view room-list-view ${isVisible ? '' : 'hidden'}`}>
      {/* Close button removed as requested */}
      
      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <ConfirmationModal
          onClose={handleCloseConfirmation}
          onConfirm={handleConfirmSubmit}
          primaryColor={primaryColor}
        />
      )}
      
      <div className="room-dropdown-header">
        <RoomDropdown
          rooms={rooms}
          temporaryRooms={temporaryRooms}
          activeRoom={activeRoom}
          classifiedRoomNames={classifiedRoomNames}
          onRoomSelect={onRoomSelect}
          onRoomNameChange={onRoomNameChange}
          onRoomNameSave={onRoomNameSave}
          onActiveInputFieldChange={handleActiveInputFieldChange}
        />
        
        <button 
          className="submit-button-header" 
          onClick={handleSubmitClick}
        >
          Submit
        </button>
      </div>
      
      <div className="model-viewer-container">
        <div 
          ref={modelViewerRef} 
          className="model-viewer"
        >
          {/* 3D model will be rendered here */}
          {!activeRoom && (
            <div className="no-room-selected">
              <p>Select a room or capture new images</p>
            </div>
          )}
        </div>
        
        <LoadingIndicator
          ref={loadingIndicatorRef}
          message="Processing room..."
          subtitle="This may take a few minutes"
          isHidden={!processingRoom}
        />
        
        {/* Camera button in the middle */}
        <button 
          ref={cameraButtonRef} 
          className="camera-button camera-button-middle"
          onClick={onToggleView}
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
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
          </svg>
        </button>
        
        {/* Submit button moved to header */}
      </div>
    </div>
  );
};

export default RoomListView;
