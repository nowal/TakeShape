import { NextRequest, NextResponse } from 'next/server';
import { getSession, createSession, updateSessionRoom, getRoom } from '@/utils/firestore/session';
import { getFirestore, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import firebaseApp from '@/lib/firebase';

// Route segment config
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Initialize Firestore
const db = getFirestore(firebaseApp);

// Collection names
const HOUSES_COLLECTION = 'houses';

// The Flask backend URL - this should be an environment variable in production
const FLASK_BACKEND_URL = 'https://api.takeshapehome.com';

// Set NODE_TLS_REJECT_UNAUTHORIZED to '0' to ignore certificate validation
// This is a global setting and should be used with caution
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Function to make a fetch request with timeout
const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 300000) => { // 5 minute timeout for video processing
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...options.headers,
        // Disable connection reuse to avoid connection pooling issues
        'Connection': 'close',
      }
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

// Retry logic for failed requests
const fetchWithRetry = async (url: string, options: RequestInit, retries = 2, timeout = 300000) => { // 5 minute timeout for video processing
  let lastError;
  
  for (let i = 0; i <= retries; i++) {
    try {
      console.log(`Attempt ${i + 1}/${retries + 1} - Starting fetch request to video-process...`);
      return await fetchWithTimeout(url, options, timeout);
    } catch (error: any) {
      console.log(`Attempt ${i + 1} failed:`, error.message);
      lastError = error;
      
      // Don't wait on the last attempt
      if (i < retries) {
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, i), 5000);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

export async function POST(request: NextRequest) {
  console.log('API route: /api/flask/video-process - POST request received');

  try {
    // 1. Parse the incoming FormData
    const incomingFormData = await request.formData();

    // 2. Extract roomId and video file
    const originalSessionId = incomingFormData.get('sessionId') as string;
    const roomId = incomingFormData.get('roomId') as string;
    const roomName = incomingFormData.get('roomName') as string || `Room ${Date.now()}`;
    const videoFile = incomingFormData.get('video') as File;
    
    // Use the video ID from the frontend if provided, otherwise generate one
    const videoId = incomingFormData.get('videoId') as string || `video_${Date.now()}`;
    const sessionId = videoId; // Use the video ID as the session ID
    
    console.log('Request data:', { 
      originalSessionId,
      newSessionId: sessionId,
      roomId, 
      roomName,
      videoFileSize: videoFile ? videoFile.size : 'No video file'
    });

    if (!roomId) {
      console.error('No room ID provided');
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
    }

    if (!videoFile) {
      console.error('No video file provided');
      return NextResponse.json({ error: 'Video file is required' }, { status: 400 });
    }

    // Check if session exists, create if it doesn't
    let sessionData = await getSession(sessionId);
    if (!sessionData) {
      console.log('Session not found, creating new session...');
      await createSession(sessionId);
      sessionData = await getSession(sessionId);
    }

    // 3. Create a NEW FormData object for the Flask request
    const flaskFormData = new FormData();
    
    // Add session ID, video ID, and video file to the FormData
    flaskFormData.append('session_id', sessionId);
    flaskFormData.append('videoId', sessionId); // Use the same ID for both
    flaskFormData.append('video', videoFile, videoFile.name);
    
    console.log('Starting video-process request with retry logic...');

    // 4. Forward the FormData to the Flask backend
    const response = await fetchWithRetry(`${FLASK_BACKEND_URL}/api/upload_video`, {
      method: 'POST',
      body: flaskFormData,
      // Let fetch set the Content-Type header automatically for FormData
    });

    // Check if the response is OK
    console.log('Flask backend response received:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
    });

    if (!response.ok) {
      const errorBody = await response.text(); // Try to get error text
      console.error(`Flask backend returned error: ${response.status}. Body: ${errorBody}`);
      // Try to parse as JSON, but default to text if it fails
      let errorJson = {};
      try { errorJson = JSON.parse(errorBody); } catch (e) {}
      return NextResponse.json(
        { error: `Flask backend returned ${response.status}`, flaskError: errorJson || errorBody },
        { status: response.status }
      );
    }

    // Get the response data
    console.log('Parsing response JSON from Flask backend...');
    const data = await response.json();
    console.log('Response data from Flask backend:', data);

    // If the response includes sections data, update it in Firestore
    if (data.sections) {
      console.log(`Updating Firestore for session ${sessionId}, room ${roomId}...`);
      
      try {
        // Get the current room data to preserve the name
        const currentRoom = await getRoom(sessionId, roomId);
        // Use the existing name if available, otherwise fall back to the provided name
        const preservedName = currentRoom?.name || roomName;
        
        console.log(`Preserving existing room name: "${preservedName}" instead of "${roomName}"`);
        
        // Update the room in Firestore with the sections data
        await updateSessionRoom(sessionId, roomId, {
          name: preservedName,
          processed: true,
          created_at: Date.now(),
          sections: data.sections,
          reconstruction: data.reconstruction
        });
        
        console.log(`Updated room ${roomId} with sections data and preserved name "${preservedName}"`);
      } catch (error) {
        console.error('Error updating room in Firestore:', error);
      }
      
      // Get the session to check for house ID
      const session = await getSession(sessionId);
      const houseId = session?.houseId;
      
      // Helper function to add room ID to house
      const addRoomIdToHouse = async (houseId: string, roomId: string) => {
        try {
          const houseRef = doc(db, HOUSES_COLLECTION, houseId);
          const houseSnap = await getDoc(houseRef);
          
          if (!houseSnap.exists()) {
            throw new Error('House not found');
          }
          
          // Update the house document to add the room ID to the roomIds array
          await updateDoc(houseRef, {
            roomIds: arrayUnion(roomId),
            updatedAt: new Date()
          });
          
          console.log(`Successfully added room ID ${roomId} to house ${houseId}`);
          return true;
        } catch (error) {
          console.error('Error adding room ID to house:', error);
          return false;
        }
      };
      
      // If the session has a house ID, add the room ID to the house
      if (houseId) {
        try {
          console.log(`Adding room ID ${roomId} to house ${houseId}`);
          await addRoomIdToHouse(houseId, roomId);
        } catch (error) {
          console.error('Error adding room ID to house:', error);
          // Continue processing even if adding to house fails
        }
      } else {
        console.log('No house ID found in session, skipping house update');
      }
    }

    // Return the data with the session ID and room ID
    return NextResponse.json({
      ...data,
      sessionId,
      roomId
    });

  } catch (error: any) {
    // Enhanced error logging
    console.error('Error in /api/flask/video-process:', {
      message: error.message,
      name: error.name,
      cause: error.cause ? error.cause : 'No cause',
      stack: error.stack?.split('\n').slice(0, 5).join('\n') // More stack trace
    });

    // Check for specific error types
    let status = 500;
    let errorDetails = error.message;
    if (error.name === 'AbortError') {
      errorDetails = 'Request to Flask backend was aborted (possibly timeout or connection issue).';
      status = 504; // Gateway Timeout might be more appropriate
    } else if (error.cause?.code === 'ECONNREFUSED') {
      errorDetails = 'Connection refused by Flask backend. Is it running?';
      status = 502; // Bad Gateway
    } else if (error.cause?.code === 'UND_ERR_HEADERS_TIMEOUT') {
      errorDetails = 'Timeout error: Flask server did not respond in time.';
      status = 504;
    }

    return NextResponse.json(
      {
        error: 'Failed processing video upload in Next.js backend.',
        details: errorDetails,
        errorType: error.name,
        errorCode: error.cause?.code || 'unknown'
      },
      { status: status }
    );
  }
}
