import { FC } from 'react';
import { PRIMARY_COLOR_HEX } from '@/constants/brand-color';

interface ConfirmationModalProps {
  onClose: () => void;
  onConfirm: () => void;
  primaryColor?: string;
}

/**
 * Modal component that displays a confirmation message before submitting a quote
 */
const ConfirmationModal: FC<ConfirmationModalProps> = ({ 
  onClose, 
  onConfirm,
  primaryColor = PRIMARY_COLOR_HEX
}) => (
  <div className="instructions-modal">
    <button className="close-button" onClick={onClose}>×</button>
    <div className="instructions-content">
      <h3 style={{ textAlign: 'center' }}>Confirm Submission</h3>
      <p style={{ textAlign: 'left' }}>We want to confirm that you have scanned all areas properly. If not, then quotes may not be accurate.</p>
      
      <button 
        className="submit-button-header" 
        onClick={onConfirm}
        style={{ 
          marginTop: '20px', 
          width: '100%',
          backgroundColor: primaryColor,
          display: 'block',
          margin: '20px auto 0'
        }}
      >
        Submit Quote
      </button>
    </div>
  </div>
);

export default ConfirmationModal;
