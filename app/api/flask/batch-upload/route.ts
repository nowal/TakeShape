import { NextRequest, NextResponse } from 'next/server';
import { getSession, createSession, updateSessionRoom, getSessionRooms } from '@/utils/firestore/session';

// Route segment config
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// The Flask backend URL - this should be an environment variable in production
const FLASK_BACKEND_URL = 'http://150.136.43.145:8080';

// Function to make a fetch request with timeout
const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 60000) => { // Increased timeout to 60s
  const controller = new AbortController();
  const id = setTimeout(() => {
      console.warn(`Workspace request to ${url} timed out after ${timeout}ms`);
      controller.abort();
  }, timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      // Consider removing 'Connection: close' unless specifically needed
      // headers: {
      //   'Connection': 'close',
      // }
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    // Log the specific error type if it's an AbortError due to timeout
    if (error instanceof Error && error.name === 'AbortError') {
        console.error(`Workspace aborted (likely timeout): ${error.message}`);
    }
    throw error;
  }
};

// Retry logic for failed requests
const fetchWithRetry = async (url: string, options: RequestInit, retries = 2, timeout = 60000) => { // Increased timeout
  let lastError;

  for (let i = 0; i <= retries; i++) {
    try {
      console.log(`Attempt ${i + 1}/${retries + 1} - Starting fetch request to ${url}...`);
      return await fetchWithTimeout(url, options, timeout);
    } catch (error: any) {
      console.log(`Attempt ${i + 1} failed:`, error.message, error.name);
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

  console.error(`Workspace failed after ${retries + 1} attempts. Last error:`, lastError);
  throw lastError;
};


export async function POST(request: NextRequest) {
  console.log('API route: /api/flask/batch-upload - POST request received');

  try {
    // --- Modification Start ---
    // --- BEGIN CONNECTIVITY TEST ---
    console.log(`[Connectivity Test] Attempting simple GET to ${FLASK_BACKEND_URL}/`);
    try {
      // Use a short timeout for the test fetch (e.g., 10 seconds)
      const testTimeout = 10000;
      const testController = new AbortController();
      const testTimeoutId = setTimeout(() => {
          console.warn(`[Connectivity Test] Aborting test request after ${testTimeout}ms`);
          testController.abort()
          }, testTimeout);

      const testResponse = await fetch(`${FLASK_BACKEND_URL}/`, { // Target the root path
        method: 'GET',
        signal: testController.signal,
        // Optional: Prevent fetch from trying redirects if '/' redirects elsewhere
        // redirect: 'manual',
      });
      clearTimeout(testTimeoutId); // Clear timeout if fetch completes/errors quickly

      // Check if status is OK-ish (2xx or 3xx redirect is fine, 404 also means server is reachable)
      if (testResponse.ok || testResponse.status === 404 || testResponse.status === 301 || testResponse.status === 302) {
        console.log(`[Connectivity Test] Success! Received status: ${testResponse.status} ${testResponse.statusText}`);
      } else {
        // Handle unexpected status codes from the test endpoint
        throw new Error(`Connectivity test received unexpected status: ${testResponse.status}`);
      }

    } catch (error: any) {
      console.error('[Connectivity Test] FAILED.');
      let errorDetails = error.message;
      let status = 502; // Bad Gateway - signifies backend unreachable

      if (error.name === 'AbortError') {
        errorDetails = `Connection test to Flask backend (${FLASK_BACKEND_URL}/) timed out after 10s.`;
        status = 504; // Gateway Timeout
      } else if (error.cause?.code === 'ECONNREFUSED') {
        errorDetails = `Connection test refused by Flask backend (${FLASK_BACKEND_URL}/). Is it running and listening correctly?`;
      } else if (error.cause?.code === 'ENOTFOUND' || error.cause?.code === 'EAI_AGAIN') {
          errorDetails = `Connection test failed: DNS lookup failed for Flask backend host (${FLASK_BACKEND_URL}). Check hostname/URL.`;
      } else if (error.message?.includes('unexpected status')) {
          // Keep status 502 for unexpected server responses during test
          errorDetails = error.message;
      }
      console.error(`[Connectivity Test] Error details: ${errorDetails} (Type: ${error.name}, Code: ${error.cause?.code})`);

      // Return error immediately if connectivity test fails
      return NextResponse.json(
        {
          error: 'Failed processing batch upload: Cannot reach Flask backend for initial check.',
          details: errorDetails,
          errorType: error.name,
          errorCode: error.cause?.code || 'unknown',
        },
        { status: status }
      );
    }
    // --- END CONNECTIVITY TEST ---

    // If connectivity test passed, proceed with the original logic...
    console.log('Connectivity test passed. Proceeding with batch upload logic...');
    // 1. Parse the incoming FormData
    console.log('Parsing form data from request...');
    const incomingFormData = await request.formData();

    // 2. Extract sessionId and files
    const sessionId = incomingFormData.get('sessionId') as string;
    console.log('Session ID from form data:', sessionId);

    if (!sessionId) {
      console.error('No session ID provided');
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Check if session exists (keep your existing logic)
    console.log('Checking if session exists in Firestore...');
    let session = await getSession(sessionId);
    if (!session) {
      console.log('Session not found, creating new session...');
      await createSession(sessionId);
    } else {
      console.log('Session found.'); // Simplified log
    }


    const imageFiles: { key: string; file: File }[] = [];
    for (const [key, value] of incomingFormData.entries()) {
        // Ensure value is a File object
        if (key.startsWith('image') && value instanceof File) {
            imageFiles.push({ key: key, file: value });
        }
    }

    console.log(`Found ${imageFiles.length} images in form data`);
    if (imageFiles.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    // 3. Create a NEW FormData object for the Flask request
    const flaskFormData = new FormData();
    console.log("Sesh:");
    console.log(sessionId);
    flaskFormData.append('sessionId', sessionId); // Add session ID back

    // Add image files to the new FormData
    for (const { key, file } of imageFiles) {
      // Use the original key (e.g., 'image0') and the original filename
      flaskFormData.append(key, file, file.name);
       console.log(`Appended ${key} (${file.name}, ${file.size} bytes) to NEW FormData for Flask.`);
    }

    // --- Modification End ---

    console.log('Starting batch upload request with retry logic (using NEW FormData)...');

    // 4. Forward the NEW FormData to the Flask backend
    const response = await fetchWithRetry(`${FLASK_BACKEND_URL}/api/batch-upload`, {
      method: 'POST',
      body: flaskFormData, // Use the newly constructed FormData
      // Let fetch set the Content-Type header automatically for FormData
    });

    // Check if the response is OK
    console.log('Flask backend response received:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
      // headers: Object.fromEntries(Array.from(response.headers.entries())) // Keep if needed for debug
    });

    if (!response.ok) {
      let errorBody = await response.text(); // Try to get error text
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

    // If the response includes room data, update it in Firestore (keep your existing logic)
    if (data.roomId && data.imagePaths && data.imagePaths.length > 0) {
        console.log(`Updating Firestore for session ${sessionId}, room ${data.roomId}...`);
        await updateSessionRoom(sessionId, data.roomId, {
            name: `Room ${data.roomId.substring(0, 4)}`, // Consider letting Flask set the initial name
            images: data.imagePaths,
            created_at: Date.now(), // Use Firestore server timestamp if possible
            processed: false // Ensure it's marked as not processed initially
        });
        console.log(`Updated room ${data.roomId} with ${data.imagePaths.length} images`);
    } else {
         console.warn('Flask response did not contain expected roomId or imagePaths.');
    }


    // Return the data with the session ID
    return NextResponse.json({
      ...data,
      sessionId
    });

  } catch (error: any) {
    // Enhanced error logging (keep your existing logic)
    console.error('Error in /api/flask/batch-upload:', {
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
        error: 'Failed processing batch upload in Next.js backend.',
        details: errorDetails,
        errorType: error.name,
        errorCode: error.cause?.code || 'unknown'
      },
      { status: status }
    );
  }
}
