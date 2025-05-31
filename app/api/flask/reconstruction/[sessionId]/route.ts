import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Route segment config
export const dynamic = 'force-dynamic'; // Disable caching at the route level
export const runtime = 'nodejs';

// The Flask backend URL - this should be an environment variable in production
const FLASK_BACKEND_URL = 'https://api.takeshapehome.com';

// Function to make a fetch request with timeout
const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 60000) => { // Increased timeout to 60 seconds
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
        // Add cache control headers to prevent caching
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
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
const fetchWithRetry = async (url: string, options: RequestInit, retries = 3, timeout = 60000) => { // Increased retries to 3 and timeout to 60 seconds
  let lastError;
  
  for (let i = 0; i <= retries; i++) {
    try {
      console.log(`Attempt ${i + 1}/${retries + 1} - Starting fetch request to reconstruction...`);
      return await fetchWithTimeout(url, options, timeout);
    } catch (error: any) {
      console.log(`Attempt ${i + 1} failed:`, error.message);
      lastError = error;
      
      // Don't wait on the last attempt
      if (i < retries) {
        // Exponential backoff with longer delays
        const delay = Math.min(2000 * Math.pow(2, i), 10000); // Increased delay
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const sessionId = params.sessionId;
  
  console.log(`API route: /api/flask/reconstruction/${sessionId} - GET request received`);
  
  try {
    // Forward the request to the Flask backend
    const response = await fetchWithRetry(`${FLASK_BACKEND_URL}/api/reconstruction/${sessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Info': 'TakeShape-Demo-App'
      }
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
    
    // Create a response with the data and add cache control headers
    const nextResponse = NextResponse.json(data);
    
    // Add cache control headers to prevent caching
    nextResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    nextResponse.headers.set('Pragma', 'no-cache');
    nextResponse.headers.set('Expires', '0');
    
    // Add a timestamp to help with debugging
    nextResponse.headers.set('X-Response-Time', Date.now().toString());
    
    // Return the response with cache control headers
    return nextResponse;
    
  } catch (error: any) {
    // Enhanced error logging
    console.error('Error in /api/flask/reconstruction:', {
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
        error: 'Failed fetching reconstruction data in Next.js backend.',
        details: errorDetails,
        errorType: error.name,
        errorCode: error.cause?.code || 'unknown'
      },
      { status: status }
    );
  }
}
