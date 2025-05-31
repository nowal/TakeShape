import React from 'react';

interface BatchProcessingStatusProps {
  isConnected: boolean;
  isInitialized: boolean;
  isProcessing: boolean;
  batchesSent: number;
  batchesProcessed: number;
  currentBatchSize: number;
  hasReconstruction: boolean;
}

const BatchProcessingStatus: React.FC<BatchProcessingStatusProps> = ({
  isConnected,
  isInitialized,
  isProcessing,
  batchesSent,
  batchesProcessed,
  currentBatchSize,
  hasReconstruction
}) => {
  return (
    <div className="batch-processing-status">
      <div className="status-row">
        <div className="status-label">Status:</div>
        <div className="status-value">
          {!isInitialized ? (
            <span className="status-connecting">Initializing...</span>
          ) : !isConnected ? (
            <span className="status-disconnected">Disconnected</span>
          ) : isProcessing ? (
            <span className="status-processing">Processing</span>
          ) : (
            <span className="status-connected">Connected</span>
          )}
        </div>
      </div>
      
      <div className="status-row">
        <div className="status-label">Batches:</div>
        <div className="status-value">
          <span className={batchesProcessed < batchesSent ? 'status-processing' : 'status-normal'}>
            {batchesProcessed}/{batchesSent}
          </span>
        </div>
      </div>
      
      {currentBatchSize > 0 && (
        <div className="status-row">
          <div className="status-label">Current Batch:</div>
          <div className="status-value">
            <span className="status-normal">{currentBatchSize} frames</span>
          </div>
        </div>
      )}
      
      {hasReconstruction && (
        <div className="status-row">
          <div className="status-label">3D Model:</div>
          <div className="status-value">
            <span className="status-success">Available</span>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .batch-processing-status {
          position: absolute;
          top: 10px;
          left: 10px;
          background-color: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 10px;
          border-radius: 5px;
          font-size: 12px;
          z-index: 20;
          max-width: 200px;
        }
        
        .status-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }
        
        .status-label {
          font-weight: bold;
          margin-right: 10px;
        }
        
        .status-value {
          text-align: right;
        }
        
        .status-connecting {
          color: #ffcc00;
        }
        
        .status-disconnected {
          color: #ff4d4f;
        }
        
        .status-connected {
          color: #52c41a;
        }
        
        .status-processing {
          color: #1890ff;
        }
        
        .status-normal {
          color: white;
        }
        
        .status-success {
          color: #52c41a;
        }
      `}</style>
    </div>
  );
};

export default BatchProcessingStatus;
