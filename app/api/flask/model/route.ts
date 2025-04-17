import { NextRequest, NextResponse } from 'next/server';

// Route segment config
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// The Flask backend URL - this should be an environment variable in production
const FLASK_BACKEND_URL = 'https://150.136.43.145:443';

// Set NODE_TLS_REJECT_UNAUTHORIZED to '0' to ignore certificate validation
// This is a global setting and should be used with caution
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export async function GET(request: NextRequest) {
  try {
    // Get the model path from the URL
    const url = new URL(request.url);
    const modelPath = url.searchParams.get('path');
    
    // If no model path is provided, return an error
    if (!modelPath) {
      return NextResponse.json(
        { error: 'Model path is required' },
        { status: 400 }
      );
    }
    
    // Construct the full URL to the model file on the Flask server
    let fullModelPath = modelPath;
    
    // If the path is relative, make it absolute
    if (modelPath.startsWith('/static/')) {
      fullModelPath = `${FLASK_BACKEND_URL}${modelPath}`;
    } else if (!modelPath.startsWith('http')) {
      fullModelPath = `${FLASK_BACKEND_URL}/static/${modelPath}`;
    }
    
    console.log(`Proxying model request to: ${fullModelPath}`);
    
    // Fetch the model file from the Flask server
    const response = await fetch(fullModelPath, {
      method: 'GET',
      // Don't include credentials to avoid CORS issues
    });
    
    // Check if the response is OK
    if (!response.ok) {
      return NextResponse.json(
        { error: `Flask backend returned ${response.status}` },
        { status: response.status }
      );
    }
    
    // Get the model file as an array buffer
    const modelData = await response.arrayBuffer();
    
    // Get the content type from the response
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // Return the model file with the correct content type
    return new NextResponse(modelData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    });
  } catch (error) {
    console.error('Error proxying model file:', error);
    return NextResponse.json(
      { error: 'Failed to fetch model file' },
      { status: 500 }
    );
  }
}
