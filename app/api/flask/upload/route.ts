import { NextRequest, NextResponse } from 'next/server';
import { getSession, createSession, updateSessionRoom, getSessionRooms } from '@/utils/firestore/session';

// Route segment config
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// The Flask backend URL - this should be an environment variable in production
const FLASK_BACKEND_URL = 'https://150.136.43.145:443';

export async function POST(request: NextRequest) {
  console.log('API route: /api/flask/upload - POST request received');
  
  try {
    // Clone the request to get the form data
    console.log('Parsing form data from request...');
    const formData = await request.formData();
    
    // Get the session ID from the form data or URL
    let sessionId = formData.get('sessionId') as string;
    console.log('Session ID from form data:', sessionId);
    
    // If no session ID is provided, check the URL search params
    if (!sessionId) {
      const url = new URL(request.url);
      sessionId = url.searchParams.get('sessionId') || '';
      console.log('Session ID from URL params:', sessionId);
    }
    
    // If still no session ID, return an error
    if (!sessionId) {
      console.error('No session ID provided');
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    // Check if session exists, create if it doesn't
    console.log('Checking if session exists in Firestore...');
    const session = await getSession(sessionId);
    if (!session) {
      console.log('Session not found, creating new session...');
      await createSession(sessionId);
    } else {
      console.log('Session found:', session);
    }
    
    // Add the session ID to the form data for the Flask backend
    formData.set('sessionId', sessionId);
    
    // Check if image is in the form data
    const image = formData.get('image');
    console.log('Image in form data:', {
      exists: !!image,
      type: image ? (image as File).type : 'N/A',
      size: image ? (image as File).size : 'N/A'
    });
    
    // Log room ID if present
    const roomId = formData.get('roomId');
    console.log('Room ID in form data:', roomId);
    
    // Log the complete request details
    console.log('Request details:', {
      url: `${FLASK_BACKEND_URL}/api/upload`,
      method: 'POST',
      formDataSummary: {
        keys: Array.from(formData.keys()),
        sessionId: formData.get('sessionId'),
        hasImage: formData.has('image'),
        imageType: formData.get('image') ? (formData.get('image') as File).type : 'N/A',
        imageSize: formData.get('image') ? (formData.get('image') as File).size : 'N/A',
      }
    });

    // Forward the request to the Flask backend
    console.log(`Forwarding request to Flask backend: ${FLASK_BACKEND_URL}/api/upload`);
    
    // Function to make a fetch request with timeout
    const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 15000) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
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
    const fetchWithRetry = async (url: string, options: RequestInit, retries = 2, timeout = 15000) => {
      let lastError;
      
      for (let i = 0; i <= retries; i++) {
        try {
          console.log(`Attempt ${i + 1}/${retries + 1} - Starting fetch request...`);
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
    
    console.log('Starting fetch request with retry logic...');
    const response = await fetchWithRetry(`${FLASK_BACKEND_URL}/api/upload`, {
      method: 'POST',
      // Don't include credentials to avoid CORS issues
      body: formData,
    });

    // Check if the response is OK
    console.log('Flask backend response:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
      headers: Object.fromEntries(Array.from(response.headers.entries()))
    });
  
    if (!response.ok) {
      console.error(`Flask backend returned error: ${response.status}`);
      return NextResponse.json(
        { error: `Flask backend returned ${response.status}` },
        { status: response.status }
      );
    }

    // Get the response data
    console.log('Parsing response JSON from Flask backend...');
    const data = await response.json();
    console.log('Response data from Flask backend:', data);
  
    // If the response includes room data, update it in Firestore
    if (data.roomId && data.imageCount) {
      // Get existing room data from Firestore
      const rooms = await getSessionRooms(sessionId);
      const existingRoom = rooms[data.roomId];
      
      if (existingRoom) {
        // Update the existing room with the new image
        const updatedRoom = { ...existingRoom };
        
        // Add the new image path if it's not already in the list
        if (data.imagePath && !updatedRoom.images.includes(data.imagePath)) {
          updatedRoom.images = [...(updatedRoom.images || []), data.imagePath];
        }
        
        // Update the room in Firestore
        await updateSessionRoom(sessionId, data.roomId, updatedRoom);
      } else {
        // Create a new room entry
        await updateSessionRoom(sessionId, data.roomId, {
          name: `Room ${Object.keys(rooms).length + 1}`,
          images: data.imagePath ? [data.imagePath] : [],
          created_at: Date.now()
        });
      }
    }

    // Return the data with the session ID
    return NextResponse.json({
      ...data,
      sessionId
    });
  } catch (error: any) {
    // Enhanced error logging
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      cause: error.cause ? {
        message: error.cause.message,
        name: error.cause.name,
        code: error.cause.code
      } : 'No cause',
      stack: error.stack?.split('\n').slice(0, 3).join('\n') // First 3 lines of stack trace
    });
    
    // Check for specific error types
    if (error.name === 'TypeError' && error.message.includes('fetch failed')) {
      console.error('Network error: Failed to connect to Flask server');
    } else if (error.cause && error.cause.code === 'UND_ERR_HEADERS_TIMEOUT') {
      console.error('Timeout error: Flask server did not respond in time');
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to connect to Flask backend', 
        details: error.message,
        errorType: error.name,
        errorCode: error.cause?.code || 'unknown'
      },
      { status: 500 }
    );
  }
}
