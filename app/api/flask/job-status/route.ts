import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/utils/firestore/session';

// Route segment config
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// The Flask backend URL - this should be an environment variable in production
const FLASK_BACKEND_URL = 'https://150.136.43.145:443';

// Set NODE_TLS_REJECT_UNAUTHORIZED to '0' to ignore certificate validation
// This is a global setting and should be used with caution
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

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
      console.log(`Attempt ${i + 1}/${retries + 1} - Starting fetch request to job-status...`);
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

export async function GET(request: NextRequest) {
  try {
    // Get the job ID from the URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const jobId = pathParts[pathParts.length - 1];
    
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }
    
    console.log(`API route: /api/flask/job-status/${jobId} - GET request received`);
    
    // Forward the request to the Flask backend
    const response = await fetchWithRetry(`${FLASK_BACKEND_URL}/api/job-status/${jobId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
    
    // If the job is complete and has a model path, convert it to use our proxy
    if (data.status === 'complete' && data.model_path) {
      // Store the original path for reference
      const originalPath = data.model_path;
      
      // Convert to our proxy URL
      const proxyUrl = new URL(`${request.nextUrl.origin}/api/flask/model`);
      proxyUrl.searchParams.set('path', originalPath);
      data.model_path = proxyUrl.toString();
      
      console.log(`Converted model path from ${originalPath} to ${data.model_path}`);
      
      // If the job is complete, update the session with the model path
      if (data.status === 'complete' && data.model_path) {
        // We could update the session here if needed
        // For now, we'll just return the data
      }
    }
    
    // Return the data
    return NextResponse.json(data);
    
  } catch (error: any) {
    // Enhanced error logging
    console.error('Error in /api/flask/job-status:', {
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
        error: 'Failed to check job status.',
        details: errorDetails,
        errorType: error.name,
        errorCode: error.cause?.code || 'unknown'
      },
      { status: status }
    );
  }
}
