import { NextRequest, NextResponse } from 'next/server';
import { getSession, createSession } from '@/utils/firestore/session';

// Route segment config
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// The Flask backend URL - this should be an environment variable in production
const FLASK_BACKEND_URL = 'https://150.136.43.145:443';

// Set NODE_TLS_REJECT_UNAUTHORIZED to '0' to ignore certificate validation
// This is a global setting and should be used with caution
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

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
      console.log(`Attempt ${i + 1}/${retries + 1} - Starting fetch request to start-processing...`);
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
  console.log('API route: /api/flask/start-processing - POST request received');
  
  try {
    // 1. Parse the incoming FormData
    const incomingFormData = await request.formData();

    // 2. Extract sessionId
    const sessionId = incomingFormData.get('sessionId') as string;
    console.log('Session ID from form data:', sessionId);

    if (!sessionId) {
      console.error('No session ID provided');
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
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

    // 4. Create a NEW FormData object for the Flask request
    const flaskFormData = new FormData();
    
    // Add the session ID to the form data
    flaskFormData.append('sessionId', sessionId);
    
    // Add image files to the new FormData with the key 'images'
    for (const file of imageFiles) {
      flaskFormData.append('images', file, file.name);
      console.log(`Appended image (${file.name}, ${file.size} bytes) to FormData for Flask.`);
    }

    console.log('Starting start-processing request with retry logic...');

    // 5. Forward the FormData to the Flask backend
    const response = await fetchWithRetry(`${FLASK_BACKEND_URL}/api/start-processing`, {
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

    // Return the data with the session ID
    return NextResponse.json({
      ...data,
      sessionId
    });

  } catch (error: any) {
    // Enhanced error logging
    console.error('Error in /api/flask/start-processing:', {
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
        error: 'Failed processing start-processing in Next.js backend.',
        details: errorDetails,
        errorType: error.name,
        errorCode: error.cause?.code || 'unknown'
      },
      { status: status }
    );
  }
}
