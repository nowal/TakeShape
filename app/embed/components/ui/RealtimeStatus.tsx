import { FC } from 'react';

interface RealtimeStatusProps {
  isConnected: boolean;
  isConnecting: boolean;
  frameCount: number;
  keyframeCount: number;
  sectionCount: number;
  currentMode: string;
}

/**
 * Component to display real-time processing status
 */
const RealtimeStatus: FC<RealtimeStatusProps> = ({
  isConnected,
  isConnecting,
  frameCount,
  keyframeCount,
  sectionCount,
  currentMode
}) => {
  // Determine connection status
  let connectionStatus = 'Disconnected';
  let statusClass = 'disconnected';
  
  if (isConnected) {
    connectionStatus = 'Connected';
    statusClass = 'connected';
  } else if (isConnecting) {
    connectionStatus = 'Connecting...';
    statusClass = 'connecting';
  }
  
  return (
    <div className="realtime-status">
      <div className={`status-dot ${statusClass}`}></div>
      <div className="status-info">
        <div>{connectionStatus}</div>
        {isConnected && (
          <div className="status-details">
            <span>Frames: {frameCount}</span>
            <span>Keyframes: {keyframeCount}</span>
            <span>Sections: {sectionCount}</span>
            <span>Mode: {currentMode}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealtimeStatus;
