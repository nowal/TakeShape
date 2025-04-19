// /app/api/anthropic/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { 
  addChatMessage, 
  getChatHistory, 
  getSession, 
  createSession, 
  ChatMessage,
  getRoom
} from '@/utils/firestore/session';
import { resizeAndCompressImage } from '@/utils/imageProcessing';

// Set NODE_TLS_REJECT_UNAUTHORIZED to '0' to ignore certificate validation
// This is a global setting and should be used with caution
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Function to convert base64 to buffer
function base64ToBuffer(base64: string): Buffer {
  // Remove data URL prefix if present
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

// Function to resize and compress an image buffer
async function processImageBuffer(buffer: Buffer): Promise<Buffer> {
  // Convert Buffer to Blob
  const blob = new Blob([buffer], { type: 'image/jpeg' });
  
  // Resize and compress the image
  const processedBlob = await resizeAndCompressImage(
    blob,
    1024, // Max width
    768,  // Max height
    0.8   // JPEG quality
  );
  
  // Convert processed Blob back to Buffer
  const arrayBuffer = await processedBlob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Function to fetch image from URL and convert to buffer
async function fetchImageAsBuffer(url: string): Promise<Buffer> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Error fetching image as buffer:', error);
    throw error;
  }
}

// Function to determine if a string is a URL
function isUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch (e) {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check if the request is multipart/form-data or JSON
    const contentType = req.headers.get('content-type') || '';
    
    let message = '';
    let sessionId = '';
    let context = '';
    let roomId = '';
    const imageBuffers: Buffer[] = [];
    
    if (contentType.includes('multipart/form-data')) {
      // Handle form data with image files
      const formData = await req.formData();
      message = formData.get('message') as string;
      sessionId = formData.get('sessionId') as string;
      context = formData.get('context') as string || '';
      roomId = formData.get('roomId') as string || '';
      
      // Extract image files
      for (const [key, value] of formData.entries()) {
        if (value instanceof Blob && key.startsWith('image')) {
          const buffer = Buffer.from(await value.arrayBuffer());
          imageBuffers.push(buffer);
        }
      }
    } else {
      // Handle JSON request
      const data = await req.json();
      message = data.message;
      sessionId = data.sessionId;
      context = data.context || '';
      roomId = data.roomId || '';
      
      // If roomId is provided but no images, try to get images from the room
      if (roomId && (!data.images || data.images.length === 0)) {
        console.log(`No images provided in request, trying to get images from room ${roomId}`);
        const room = await getRoom(sessionId, roomId);
        
        // Type assertion to fix TypeScript errors
        const roomWithImages = room as { id: string; images?: string[] };
        
        if (roomWithImages && roomWithImages.images && roomWithImages.images.length > 0) {
          console.log(`Found ${roomWithImages.images.length} images in room ${roomId}`);
          
          // Process each image URL or data URL
          for (const imageSource of roomWithImages.images) {
            try {
              let buffer: Buffer;
              
              if (isUrl(imageSource)) {
                // It's a URL, fetch the image
                console.log(`Fetching image from URL: ${imageSource.substring(0, 50)}...`);
                buffer = await fetchImageAsBuffer(imageSource);
              } else if (imageSource.startsWith('data:')) {
                // It's a data URL, convert to buffer
                console.log('Converting data URL to buffer');
                buffer = base64ToBuffer(imageSource);
              } else {
                console.warn(`Unrecognized image format: ${imageSource.substring(0, 20)}...`);
                continue;
              }
              
              imageBuffers.push(buffer);
            } catch (error) {
              console.error('Error processing image:', error);
            }
          }
        } else {
          console.log(`No images found in room ${roomId}`);
        }
      } else if (data.images && Array.isArray(data.images)) {
        // Process images from the request
        for (const image of data.images) {
          if (typeof image === 'string') {
            try {
              const buffer = base64ToBuffer(image);
              imageBuffers.push(buffer);
            } catch (error) {
              console.error('Error converting image to buffer:', error);
            }
          }
        }
      }
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    console.log(`Processing request for session ${sessionId} with ${imageBuffers.length} images`);

    // Check if session exists, create if it doesn't
    const session = await getSession(sessionId);
    if (!session) {
      await createSession(sessionId);
    }

    // Get chat history from the session
    const chatHistory = await getChatHistory(sessionId);
    
    // Add the new user message
    await addChatMessage(sessionId, message, 'user');

    // Create a system message for 3D reconstruction assistance
    const systemMessage = `You are a helpful assistant for a 3D reconstruction application. 
    Your role is to help users with the 3D reconstruction process using the MASt3R technology.
    
    The user is working with a web application that:
    1. Allows them to take photos of a room or object
    2. Processes these photos to create a 3D model
    3. Displays the 3D model for viewing and interaction
    4. Saves their data in Firestore with session management
    
    ${context ? `Current context: ${context}` : ''}
    
    The application uses:
    - A session-based system to track user interactions
    - Firestore database to store user data, chat history, and 3D models
    - A Flask backend running MASt3R for 3D reconstruction
    - Next.js for the frontend interface
    
    Guide the user through the process by:
    1. Helping them understand how to take good photos for reconstruction (at least 4 photos are required)
    2. Explaining the reconstruction process and how the MASt3R technology works
    3. Troubleshooting any issues they encounter with the camera, upload, or 3D model viewing
    4. Answering questions about the 3D models, technology, and data storage
    5. Providing tips for getting the best results from their scans
    
    If you are analyzing room images for add-on features:
    1. Look carefully at all provided images
    2. Identify any special features that might affect pricing (crown molding, wainscoting, etc.)
    3. Be specific about what you see in the images
    4. Respond with YES or NO followed by a brief explanation when asked about specific conditions
    
    Be friendly, helpful, and concise in your responses. If the user asks about technical details you're unsure of,
    you can explain that you're an assistant for the application and can help with general usage questions.`;

    // Create the messages array for the API request
    const messages = chatHistory.map((msg: ChatMessage) => ({
      role: msg.role,
      content: msg.content
    }));

    // Create the user message content
    const userMessageContent: any[] = [
      {
        type: 'text',
        text: message
      }
    ];
    
    // Add images to the message if available
    if (imageBuffers.length > 0) {
      console.log('Processing images to reduce size...');
      const processedBuffers: Buffer[] = [];
      
      for (const buffer of imageBuffers) {
        try {
          console.log(`Original image size: ${buffer.length} bytes`);
          const processedBuffer = await processImageBuffer(buffer);
          console.log(`Processed image size: ${processedBuffer.length} bytes (${Math.round(processedBuffer.length / buffer.length * 100)}% of original)`);
          processedBuffers.push(processedBuffer);
        } catch (error) {
          console.error('Error processing image:', error);
          // If processing fails, use the original image
          processedBuffers.push(buffer);
        }
      }
      
      // Limit to first 4 images to avoid token limits
      const buffersToProcess = processedBuffers.slice(0, 4);
      
      for (const buffer of buffersToProcess) {
        userMessageContent.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/jpeg',
            data: buffer.toString('base64')
          }
        });
      }
      
      console.log(`Added ${buffersToProcess.length} processed images to the message`);
    } else {
      console.log('No images to add to the message');
    }

    // Add the new user message to the array
    messages.push({
      role: 'user',
      content: userMessageContent
    });

    // Call the Anthropic API with Claude 3.7 Sonnet
    const anthropicResponse = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 2000,
      system: systemMessage,
      messages
    });

    // Extract the assistant's response
    let assistantContent = '';
    for (const block of anthropicResponse.content) {
      if (block.type === 'text') {
        assistantContent += block.text;
      }
    }

    // Add the assistant's response to the chat history
    await addChatMessage(sessionId, assistantContent, 'assistant');

    // Return the response
    return NextResponse.json({ 
      response: assistantContent
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
