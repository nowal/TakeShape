import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { ROOM_TYPES, isValidRoomType, DEFAULT_ROOM_NAME } from '@/constants/rooms';

// Route segment config
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Function to convert Buffer to base64
function bufferToBase64(buffer: Buffer, mimeType: string = 'image/jpeg'): string {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

export async function POST(req: NextRequest) {
  try {
    // Check if the request is multipart/form-data or JSON
    const contentType = req.headers.get('content-type') || '';
    
    const imageBuffers: Buffer[] = [];
    let sessionId: string = '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle form data with image files
      const formData = await req.formData();
      sessionId = formData.get('sessionId') as string;
      
      // Extract image files
      for (const [key, value] of formData.entries()) {
        if (value instanceof Blob && key.startsWith('image')) {
          const buffer = Buffer.from(await value.arrayBuffer());
          imageBuffers.push(buffer);
        }
      }
    } else {
      // Handle JSON with base64 images
      const { images, sessionId: sid } = await req.json();
      sessionId = sid;
      
      if (images && Array.isArray(images)) {
        for (const image of images) {
          if (typeof image === 'string') {
            // Convert base64 string to buffer
            const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            imageBuffers.push(buffer);
          }
        }
      }
    }
    
    if (imageBuffers.length === 0) {
      return NextResponse.json({ error: 'Images are required' }, { status: 400 });
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    console.log(`Classifying room for session ${sessionId} with ${imageBuffers.length} images`);

    // Limit to first 4 images to avoid token limits
    const buffersToProcess = imageBuffers.slice(0, 4);

    // Create the system message for room classification
    const systemMessage = `You are an expert in interior design and home architecture. Your task is to identify what type of room is shown in the provided images.

IMPORTANT: You must classify the room as one of the following types ONLY:
${ROOM_TYPES.join(', ')}

Rules:
1. Analyze all provided images carefully to determine the room type.
2. Consider furniture, fixtures, layout, and visible appliances.
3. If multiple room types are visible, choose the predominant one.
4. If you cannot confidently determine the room type, choose the most likely option.
5. Your response must be EXACTLY one of the room types listed above, with no additional text.`;

    // Create the user message with images
    const userMessage = {
      role: 'user' as const,
      content: [
        {
          type: 'text' as const,
          text: 'Please identify what type of room is shown in these images. Respond with ONLY the room type from the provided list.'
        },
        ...buffersToProcess.map((buffer: Buffer) => ({
          type: 'image' as const,
          source: {
            type: 'base64' as const,
            media_type: 'image/jpeg' as const,
            data: buffer.toString('base64')
          }
        }))
      ]
    };

    // Call the Anthropic API with Claude 3.7 Sonnet
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 100, // Small limit since we only need a short response
      system: systemMessage,
      messages: [userMessage]
    });

    // Extract the assistant's response
    let roomType = '';
    for (const block of response.content) {
      if (block.type === 'text') {
        // Clean up the response - remove any extra text, punctuation, etc.
        const cleanedResponse = block.text.trim();
        roomType = cleanedResponse;
        break;
      }
    }

    console.log(`Claude classified the room as: "${roomType}"`);

    // Validate that the response is a valid room type
    if (!isValidRoomType(roomType)) {
      console.warn(`Invalid room type returned by Claude: "${roomType}". Using default.`);
      roomType = DEFAULT_ROOM_NAME;
    }

    // Return the classified room type
    return NextResponse.json({ 
      roomType,
      confidence: 'high' // We could add confidence scoring in the future
    });

  } catch (error) {
    console.error('Error classifying room:', error);
    return NextResponse.json(
      { error: 'Failed to classify room', roomType: DEFAULT_ROOM_NAME },
      { status: 500 }
    );
  }
}
