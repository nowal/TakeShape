import { NextRequest, NextResponse } from 'next/server';
import { getSession, createSession, getSessionRooms, updateRoomName } from '@/utils/firestore/session';

// Route segment config
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// The Flask backend URL - this should be an environment variable in production
const FLASK_BACKEND_URL = 'http://150.136.43.145:8080';

export async function GET(request: NextRequest) {
  try {
    // Get the session ID from the URL
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');
    
    // If no session ID is provided, return an error
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    // Check if session exists, create if it doesn't
    const session = await getSession(sessionId);
    if (!session) {
      await createSession(sessionId);
      
      // Return empty rooms for new session
      return NextResponse.json({
        rooms: {},
        sessionId
      });
    }
    
    // Get rooms from Firestore
    const rooms = await getSessionRooms(sessionId);
    
    // Process model paths in room data to use our proxy
    Object.keys(rooms).forEach(roomId => {
      const room = rooms[roomId];
      if (room.model_path) {
        // Store the original path for reference
        const originalPath = room.model_path;
        
        // Check if the path is already a proxy URL to avoid double-encoding
        if (originalPath.includes('/api/flask/model?path=')) {
          console.log(`Model path is already a proxy URL: ${originalPath}`);
          return; // Skip this room
        }
        
        // Convert to our proxy URL
        const proxyUrl = new URL(`${request.nextUrl.origin}/api/flask/model`);
        proxyUrl.searchParams.set('path', originalPath);
        room.model_path = proxyUrl.toString();
        
        console.log(`Converted model path from ${originalPath} to ${room.model_path}`);
      }
    });
    
    // Return the rooms from Firestore
    return NextResponse.json({
      rooms,
      sessionId
    });
  } catch (error) {
    console.error('Error getting rooms from Firestore:', error);
    return NextResponse.json(
      { error: 'Failed to get rooms' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get the room ID from the URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const roomId = pathParts[pathParts.length - 1];

    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      );
    }

    // Get the request body
    const body = await request.json();
    
    // Get the session ID from the request body or URL
    let sessionId = body.sessionId;
    
    // If no session ID is provided, check the URL search params
    if (!sessionId) {
      sessionId = url.searchParams.get('sessionId');
    }
    
    // If still no session ID, return an error
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    // Check if session exists
    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    // Update room name in Firestore if provided
    if (body.name) {
      await updateRoomName(sessionId, roomId, body.name);
    }
    
    // Add the session ID to the request body for the Flask backend
    const requestBody = {
      ...body,
      sessionId
    };

    // Function to make a fetch request with timeout
    const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 15000) => {
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
    const fetchWithRetry = async (url: string, options: RequestInit, retries = 2, timeout = 15000) => {
      let lastError;
      
      for (let i = 0; i <= retries; i++) {
        try {
          console.log(`Attempt ${i + 1}/${retries + 1} - Starting fetch request to update room...`);
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
    
    console.log('Starting room update request with retry logic...');
    // Forward the request to the Flask backend
    const response = await fetchWithRetry(`${FLASK_BACKEND_URL}/api/rooms/${roomId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      // Don't include credentials to avoid CORS issues
      body: JSON.stringify(requestBody),
    });

    // Check if the response is OK
    if (!response.ok) {
      return NextResponse.json(
        { error: `Flask backend returned ${response.status}` },
        { status: response.status }
      );
    }

    // Get the response data
    const data = await response.json();

    // Return the data with the session ID
    return NextResponse.json({
      ...data,
      sessionId
    });
  } catch (error) {
    console.error('Error updating room:', error);
    return NextResponse.json(
      { error: 'Failed to update room' },
      { status: 500 }
    );
  }
}
