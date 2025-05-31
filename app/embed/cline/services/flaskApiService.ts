/**
 * Service for direct communication with the Flask API
 */

// API base URL for direct Flask communication
const FLASK_API_BASE_URL = 'https://api.takeshapehome.com/api';

// Types
export interface SessionResponse {
  status: string;
  session_id: string;
}

export interface ProcessingStatusResponse {
  processing_complete: boolean;
  batches_processed: number;
  batches_received: number;
  queue_size: number;
  has_reconstruction: boolean;
}

export interface ReconstructionResponse {
  status: string;
  reconstruction: {
    points: number[][];
    colors: number[][];
  };
  sections?: any[];
}

export interface ProcessFramesResponse {
  status: string;
  message: string;
  batch_id?: string;
  relocalization_needed?: boolean;
  relocalization_successful?: boolean;
  in_relocalization_mode?: boolean;
  reconstruction?: {
    points: number[][];
    colors: number[][];
  };
  sections?: any[];
}

/**
 * Start a new session with the Flask backend
 */
export const startSession = async (): Promise<SessionResponse> => {
  const response = await fetch(`${FLASK_API_BASE_URL}/start-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to start session: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Check the processing status for a session
 */
export const checkProcessingStatus = async (sessionId: string): Promise<ProcessingStatusResponse> => {
  const response = await fetch(`${FLASK_API_BASE_URL}/check_processing/${sessionId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to check processing status: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
};

/**
 * Get the reconstruction data for a session
 */
export const getReconstruction = async (sessionId: string): Promise<ReconstructionResponse> => {
  const response = await fetch(`${FLASK_API_BASE_URL}/reconstruction/${sessionId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to get reconstruction: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
};

/**
 * Process frames for a session
 */
export const processFrames = async (sessionId: string, frames: string[]): Promise<ProcessFramesResponse> => {
  // Create FormData
  const formData = new FormData();
  
  // Add frames as files
  frames.forEach((frameData, index) => {
    // Convert base64 to blob
    const byteString = atob(frameData.split(',')[1]);
    const mimeType = frameData.split(',')[0].split(':')[1].split(';')[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const intArray = new Uint8Array(arrayBuffer);
    
    for (let i = 0; i < byteString.length; i++) {
      intArray[i] = byteString.charCodeAt(i);
    }
    
    const blob = new Blob([arrayBuffer], { type: mimeType });
    formData.append('frames', blob, `frame_${index}.jpg`);
  });
  
  // Send request
  const response = await fetch(`${FLASK_API_BASE_URL}/process-frames/${sessionId}`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error(`Failed to process frames: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
};

/**
 * Enter relocalization mode for a session
 */
export const enterRelocalizationMode = async (sessionId: string): Promise<{ status: string; message: string }> => {
  const response = await fetch(`${FLASK_API_BASE_URL}/enter-relocalization-mode/${sessionId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to enter relocalization mode: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};
