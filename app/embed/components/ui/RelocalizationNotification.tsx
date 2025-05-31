import { FC } from 'react';

interface RelocalizationNotificationProps {
  isVisible: boolean;
  mode: 'needed' | 'inProgress' | 'succeeded';
  onClose?: () => void;
}

/**
 * Component to display relocalization notifications
 */
const RelocalizationNotification: FC<RelocalizationNotificationProps> = ({
  isVisible,
  mode,
  onClose
}) => {
  if (!isVisible) {
    return null;
  }
  
  // Determine message based on mode
  let message = '';
  let icon = '';
  
  switch (mode) {
    case 'needed':
      message = 'Lost overlap. Please go back to last successful area.';
      icon = '⚠️';
      break;
    case 'inProgress':
      message = 'Relocalizing... Please scan areas you\'ve already captured.';
      icon = '🔄';
      break;
    case 'succeeded':
      message = 'Successfully relocalized! Please continue scanning.';
      icon = '✅';
      break;
    default:
      message = 'Relocalization in progress...';
      icon = '🔄';
  }
  
  return (
    <div className={`relocalization-notification ${!isVisible ? 'hidden' : ''}`}>
      <div className="relocalization-icon">{icon}</div>
      <div className="relocalization-message">{message}</div>
      {onClose && (
        <button 
          className="relocalization-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default RelocalizationNotification;
