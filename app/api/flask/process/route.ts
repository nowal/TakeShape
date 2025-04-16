import { NextRequest, NextResponse } from 'next/server';
import { getSession, createSession, updateSessionRoom, getSessionRooms } from '@/utils/firestore/session';
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
const FLASK_BACKEND_URL = 'https://150.136.43.145:443';

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    
    // Get the session ID from the request body or URL
    let sessionId = body.sessionId;
    
    // If no session ID is provided, check the URL search params
    if (!sessionId) {
      const url = new URL(request.url);
      sessionId = url.searchParams.get('sessionId');
    }
    
    // If still no session ID, return an error
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
    }
    
    // Add the session ID to the request body for the Flask backend
    const requestBody = {
      ...body,
      sessionId
    };

    // Function to make a fetch request with timeout
    const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 30000) => {
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
    const fetchWithRetry = async (url: string, options: RequestInit, retries = 2, timeout = 30000) => {
      let lastError;
      
      for (let i = 0; i <= retries; i++) {
        try {
          console.log(`Attempt ${i + 1}/${retries + 1} - Starting fetch request to process room...`);
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
    
    // Get existing room data from Firestore
    console.log(`Getting room data for room ${body.roomId} from Firestore...`);
    
    // Get existing room data
    const rooms = await getSessionRooms(sessionId);
    const existingRoom = rooms[body.roomId];
    
    if (!existingRoom) {
      console.error(`Room ${body.roomId} not found in Firestore`);
      return NextResponse.json(
        { error: 'Room not found in Firestore' },
        { status: 404 }
      );
    }
    
    // Get the image paths from the room
    const imagePaths = existingRoom.images || [];
    
    if (imagePaths.length < 2) {
      console.error(`Not enough images in room ${body.roomId}, found ${imagePaths.length}`);
      return NextResponse.json(
        { error: 'Need at least 2 images' },
        { status: 400 }
      );
    }
    
    console.log(`Found ${imagePaths.length} images for room ${body.roomId}, need to re-upload images...`);
    
    // We need to download the images from the image paths and then upload them to the Flask server
    // This is because the Flask server might have restarted and lost its in-memory data
    
    // Declare response variable outside the try block so it's accessible in the outer scope
    let response: Response;
    
    try {
      // First, we'll create a new batch upload request with the same images
      console.log('Creating a new batch upload request...');
      
      // Create a FormData object for the batch upload
      const formData = new FormData();
      formData.append('sessionId', sessionId);
      
      // Download and re-upload each image
      console.log('Downloading images from paths...');
      
      // We need to fetch each image and add it to the FormData
      const imagePromises = imagePaths.map(async (imagePath: string, index: number) => {
        try {
          console.log(`Fetching image ${index + 1}/${imagePaths.length}: ${imagePath}`);
          
          // Extract the filename from the path
          const filename = imagePath.split('/').pop() || `image_${Date.now()}_${index}.jpg`;
          
          // Fetch the image
          const imageResponse = await fetch(imagePath);
          
          if (!imageResponse.ok) {
            console.error(`Failed to fetch image ${index + 1}: ${imageResponse.status} ${imageResponse.statusText}`);
            return null;
          }
          
          // Convert the image to a blob
          const imageBlob = await imageResponse.blob();
          
          // Add the image to the FormData
          formData.append(`image${index}`, imageBlob, filename);
          console.log(`Added image${index} to FormData: ${filename}, ${imageBlob.size} bytes`);
          
          return { index, filename, size: imageBlob.size };
        } catch (error) {
          console.error(`Error fetching image ${index + 1}:`, error);
          return null;
        }
      });
      
      // Wait for all images to be fetched and added to the FormData
      const imageResults = await Promise.all(imagePromises);
      const validImages = imageResults.filter(result => result !== null);
      
      if (validImages.length === 0) {
        throw new Error('Failed to fetch any images');
      }
      
      console.log(`Successfully fetched ${validImages.length}/${imagePaths.length} images`);
      
      // Now upload the images to the Flask server
      console.log('Uploading images to Flask server...');
      
      const batchUploadResponse = await fetchWithRetry(`${FLASK_BACKEND_URL}/api/batch-upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!batchUploadResponse.ok) {
        throw new Error(`Batch upload failed: ${batchUploadResponse.status} ${batchUploadResponse.statusText}`);
      }
      
      // Parse the response to get the new room ID
      const batchUploadData = await batchUploadResponse.json();
      
      if (!batchUploadData.roomId) {
        throw new Error('Batch upload response missing roomId');
      }
      
      const newRoomId = batchUploadData.roomId;
      console.log(`Batch upload successful, new room ID: ${newRoomId}`);
      
      // Now process the room with the new room ID
      console.log(`Processing room ${newRoomId} in Flask server...`);
      
      response = await fetchWithRetry(`${FLASK_BACKEND_URL}/api/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: newRoomId,
          sessionId
        }),
      });
    } catch (error) {
      console.error('Error during image re-upload and processing:', error);
      
      // Fall back to the original approach if re-upload fails
      console.log('Falling back to direct processing with original room ID...');
      
      response = await fetchWithRetry(`${FLASK_BACKEND_URL}/api/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: body.roomId,
          sessionId
        }),
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
    }

    // Check if the response is OK
    if (!response.ok) {
      return NextResponse.json(
        { error: `Flask backend returned ${response.status}` },
        { status: response.status }
      );
    }

    // Get the response data
    const data = await response.json();

    // If the response contains a modelPath, convert it to use our proxy
    if (data.modelPath) {
      // Store the original path for reference
      const originalPath = data.modelPath;
      
      // Convert to our proxy URL
      const proxyUrl = new URL(`${request.nextUrl.origin}/api/flask/model`);
      proxyUrl.searchParams.set('path', originalPath);
      data.modelPath = proxyUrl.toString();
      
      console.log(`Converted model path from ${originalPath} to ${data.modelPath}`);
    }
    
    // If the response includes room data, update it in Firestore
    if (data.roomId && data.modelPath) {
      // Get existing room data
      const rooms = await getSessionRooms(sessionId);
      const existingRoom = rooms[data.roomId];
      
      // Get the session to check for house ID
      const session = await getSession(sessionId);
      const houseId = session?.houseId;
      
      // First update the room with just the model path, without setting processed to true yet
      if (existingRoom) {
        // Update the room with the model path only
        await updateSessionRoom(sessionId, data.roomId, {
          ...existingRoom,
          model_path: data.modelPath
        });
      } else {
        // Create a new room entry if it doesn't exist
        await updateSessionRoom(sessionId, data.roomId, {
          name: `Room ${Object.keys(rooms).length + 1}`,
          model_path: data.modelPath,
          images: []
        });
      }
      
      // Verify the model is accessible before setting processed to true
      try {
        console.log(`Verifying model accessibility at: ${data.modelPath}`);
        
        // Try to fetch the model to verify it's accessible
        const modelResponse = await fetch(data.modelPath, {
          method: 'HEAD',  // Use HEAD request to check if the file exists without downloading it
          headers: {
            'Cache-Control': 'no-cache'  // Bypass cache to ensure we're checking the actual file
          }
        });
        
        if (modelResponse.ok) {
          console.log(`Model verified, setting processed flag to true for room ${data.roomId}`);
          
          // Now that we've verified the model is accessible, set processed to true
          await updateSessionRoom(sessionId, data.roomId, {
            processed: true
          });
        } else {
          console.warn(`Model verification failed with status: ${modelResponse.status}, not setting processed flag`);
        }
      } catch (error) {
        console.error('Error verifying model accessibility:', error);
        // Don't set processed to true if we can't verify the model
      }
      
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
          console.log(`Adding room ID ${data.roomId} to house ${houseId}`);
          await addRoomIdToHouse(houseId, data.roomId);
        } catch (error) {
          console.error('Error adding room ID to house:', error);
          // Continue processing even if adding to house fails
          // This ensures the room is still created in the session
        }
      } else {
        console.log('No house ID found in session, skipping house update');
      }
    }

    // Return the modified data with the session ID
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
    } else if (error.name === 'AbortError') {
      console.error('Request aborted: The request took too long and was aborted');
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
