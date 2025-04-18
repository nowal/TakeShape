import { NextRequest, NextResponse } from 'next/server';
import { getSession, createSession, updateSessionRoom } from '@/utils/firestore/session';
import { getFirestore, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import firebaseApp from '@/lib/firebase';
import { getFallbackRoomName } from '@/constants/rooms';

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
const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 180000) => { // 180 second timeout (3 minutes)
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
const fetchWithRetry = async (url: string, options: RequestInit, retries = 2, timeout = 180000) => { // 180 second timeout (3 minutes)
  let lastError;
  
  for (let i = 0; i <= retries; i++) {
    try {
      console.log(`Attempt ${i + 1}/${retries + 1} - Starting fetch request to direct-process...`);
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
  console.log('API route: /api/flask/direct-process - POST request received');

  try {
    // 1. Parse the incoming FormData
    const incomingFormData = await request.formData();

    // 2. Extract sessionId, roomId, and files
    const sessionId = incomingFormData.get('sessionId') as string;
    const roomId = incomingFormData.get('roomId') as string;
    const roomName = incomingFormData.get('roomName') as string || `Room ${Date.now()}`;
    
    console.log('Request data:', { sessionId, roomId, roomName });

    if (!sessionId) {
      console.error('No session ID provided');
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    if (!roomId) {
      console.error('No room ID provided');
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
    }

    // Check if session exists, create if it doesn't
    let sessionData = await getSession(sessionId);
    if (!sessionData) {
      console.log('Session not found, creating new session...');
      await createSession(sessionId);
      sessionData = await getSession(sessionId);
    }

    // 3. Extract all image files
    const imageFiles: File[] = [];
    for (const [key, value] of incomingFormData.entries()) {
      if (key.startsWith('image') && value instanceof File) {
        imageFiles.push(value);
      }
    }

    console.log(`Found ${imageFiles.length} images in form data`);
    if (imageFiles.length < 2) {
      return NextResponse.json({ error: 'At least 2 images are required' }, { status: 400 });
    }

    // Get the number of rooms to determine a fallback room name
    const roomCount = sessionData?.rooms ? Object.keys(sessionData.rooms).length : 0;
    const fallbackRoomName = `Room ${roomCount + 1}`;
    
    // Classify the room using Claude
    let classifiedRoomName = roomName;
    
    try {
      console.log('Classifying room based on images...');
      
      // Create a new FormData for the classify-room endpoint
      const classifyFormData = new FormData();
      classifyFormData.append('sessionId', sessionId);
      
      // Add the image files to the FormData
      for (let i = 0; i < imageFiles.length; i++) {
        classifyFormData.append(`image${i}`, imageFiles[i]);
      }
      
      // Call the classify-room endpoint
      const classifyResponse = await fetch(`${request.nextUrl.origin}/api/classify-room`, {
        method: 'POST',
        body: classifyFormData
      });
      
      if (classifyResponse.ok) {
        const classifyData = await classifyResponse.json();
        if (classifyData.roomType) {
          classifiedRoomName = classifyData.roomType;
          console.log(`Room classified as: ${classifiedRoomName}`);
          
          // Update the room name immediately in Firestore
          console.log(`Updating room name to "${classifiedRoomName}" immediately`);
          const updateNameResponse = await fetch(`${request.nextUrl.origin}/api/rooms/update-name`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              sessionId,
              roomId,
              name: classifiedRoomName
            })
          });
          
          if (updateNameResponse.ok) {
            console.log('Room name updated successfully');
          } else {
            console.warn('Failed to update room name immediately:', await updateNameResponse.text());
          }
        } else {
          console.log('Room classification did not return a room type, using fallback name');
          classifiedRoomName = fallbackRoomName;
        }
      } else {
        console.warn('Room classification failed, using fallback name');
        classifiedRoomName = fallbackRoomName;
      }
    } catch (error) {
      console.error('Error classifying room:', error);
      console.log('Using fallback room name due to classification error');
      classifiedRoomName = fallbackRoomName;
    }
    
    console.log(`Using room name: ${classifiedRoomName}`);
    
    // 6. Create a NEW FormData object for the Flask request
    const flaskFormData = new FormData();
    
    // Add image files to the new FormData with the key 'images'
    for (const file of imageFiles) {
      flaskFormData.append('images', file, file.name);
      console.log(`Appended image (${file.name}, ${file.size} bytes) to FormData for Flask.`);
    }

    console.log('Starting direct-process request with retry logic...');

    // 5. Forward the FormData to the Flask backend
    const response = await fetchWithRetry(`${FLASK_BACKEND_URL}/api/direct-process`, {
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

    // If the response includes model data, update it in Firestore
    if (data.modelPath) {
      // Store the original path for reference
      const originalPath = data.modelPath;
      
      // Convert to our proxy URL
      const proxyUrl = new URL(`${request.nextUrl.origin}/api/flask/model`);
      proxyUrl.searchParams.set('path', originalPath);
      data.modelPath = proxyUrl.toString();
      
      console.log(`Converted model path from ${originalPath} to ${data.modelPath}`);
      
      console.log(`Updating Firestore for session ${sessionId}, room ${roomId}...`);
      
      // Update the room in Firestore with the model path and classified room name
      await updateSessionRoom(sessionId, roomId, {
        name: classifiedRoomName, // Use the classified room name
        model_path: data.modelPath,
        processed: true,
        created_at: Date.now(),
      });
      
      console.log(`Updated room ${roomId} with model path ${data.modelPath} and name "${classifiedRoomName}"`);
      
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
    console.error('Error in /api/flask/direct-process:', {
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
        error: 'Failed processing direct upload in Next.js backend.',
        details: errorDetails,
        errorType: error.name,
        errorCode: error.cause?.code || 'unknown'
      },
      { status: status }
    );
  }
}
