'use client';

// Direct API service for communicating with the Flask backend
// This bypasses the Next.js API routes and communicates directly with the Flask server

// API base URL - direct Flask backend URL
const DIRECT_API_BASE_URL = 'https://api.takeshapehome.com';

/**
 * Start a new session with the backend
 * @returns Promise with the session ID
 */
export const startSession = async (): Promise<string> => {
  try {
    const response = await fetch(`${DIRECT_API_BASE_URL}/api/start-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to start session: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.session_id) {
      throw new Error('No session ID returned from server');
    }

    console.log(`Session started with ID: ${data.session_id}`);
    return data.session_id;
  } catch (error) {
    console.error('Error starting session:', error);
    throw error;
  }
};

/**
 * Process frames for a session
 * @param sessionId The session ID
 * @param frames Array of base64-encoded frame data
 * @returns Promise with the processing result
 */
export const processFrames = async (sessionId: string, frames: string[]): Promise<any> => {
  if (!sessionId) {
    throw new Error('No session ID provided');
  }

  if (frames.length === 0) {
    throw new Error('No frames provided');
  }

  try {
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
    const response = await fetch(`${DIRECT_API_BASE_URL}/api/process-frames/${sessionId}`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Failed to process frames: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error processing frames:', error);
    throw error;
  }
};

/**
 * Get the reconstruction for a session
 * @param sessionId The session ID
 * @returns Promise with the reconstruction data
 */
export const getReconstruction = async (sessionId: string): Promise<any> => {
  if (!sessionId) {
    throw new Error('No session ID provided');
  }

  try {
    const response = await fetch(`${DIRECT_API_BASE_URL}/api/reconstruction/${sessionId}`);

    if (!response.ok) {
      if (response.status === 404) {
        // No reconstruction available yet
        return null;
      }
      throw new Error(`Failed to get reconstruction: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status !== 'success' || !data.reconstruction) {
      return null;
    }

    return data.reconstruction;
  } catch (error) {
    console.error('Error getting reconstruction:', error);
    throw error;
  }
};

/**
 * Enter relocalization mode for a session
 * @param sessionId The session ID
 * @returns Promise with the result
 */
export const enterRelocalizationMode = async (sessionId: string): Promise<any> => {
  if (!sessionId) {
    throw new Error('No session ID provided');
  }

  try {
    const response = await fetch(`${DIRECT_API_BASE_URL}/api/enter-relocalization-mode/${sessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to enter relocalization mode: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error entering relocalization mode:', error);
    throw error;
  }
};
