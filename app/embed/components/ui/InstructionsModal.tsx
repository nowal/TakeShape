import { FC } from 'react';

interface InstructionsModalProps {
  onClose: () => void;
  businessName?: string;
}

/**
 * Modal component that displays instructions for capturing room images
 */
const InstructionsModal: FC<InstructionsModalProps> = ({ onClose, businessName }) => (
  <div className="instructions-modal">
    <button className="close-button" onClick={onClose}>×</button>
    <div className="instructions-content">
      <h3>How to Get a Quote from {businessName || 'Your Provider'}</h3>
      <ol>
        <li>Hold your phone steady and capture images from different angles</li>
        <li>Take at least 4 images for best results</li>
        <li>Ensure good lighting for better quality</li>
        <li>Avoid moving objects in the frame</li>
      </ol>
    </div>
  </div>
);

export default InstructionsModal;
