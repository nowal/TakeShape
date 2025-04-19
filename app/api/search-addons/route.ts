import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getPricingSheetByProviderId } from '@/utils/firestore/pricingSheet';
import { getRoom } from '@/utils/firestore/session';
import { resizeAndCompressImage } from '@/utils/imageProcessing';

// Set NODE_TLS_REJECT_UNAUTHORIZED to '0' to ignore certificate validation
// This is a global setting and should be used with caution
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Initialize Anthropic client
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
    
    let sessionId = '';
    let roomId = '';
    let providerId = '';
    const imageBuffers: Buffer[] = [];
    
    if (contentType.includes('multipart/form-data')) {
      // Handle form data with image files
      const formData = await req.formData();
      sessionId = formData.get('sessionId') as string;
      roomId = formData.get('roomId') as string;
      providerId = formData.get('providerId') as string;
      
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
      sessionId = data.sessionId;
      roomId = data.roomId;
      providerId = data.providerId;
      
      // If images are provided in the request
      if (data.images && Array.isArray(data.images)) {
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

    console.log('Search add-ons API called with params:', { 
      sessionId, 
      roomId, 
      providerId,
      imageBuffersCount: imageBuffers.length 
    });

    if (!sessionId) {
      console.error('Missing required parameter: sessionId');
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    if (!roomId) {
      console.error('Missing required parameter: roomId');
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
    }

    if (!providerId) {
      console.error('Missing required parameter: providerId');
      return NextResponse.json({ error: 'Provider ID is required' }, { status: 400 });
    }

    // If no images were provided in the request, try to get them from the room
    if (imageBuffers.length === 0) {
      console.log(`No images provided in request, trying to get images from room ${roomId}`);
      const room = await getRoom(sessionId, roomId);
      
      if (room && room.images && room.images.length > 0) {
        console.log(`Found ${room.images.length} images in room ${roomId}`);
        
        // Process each image URL or data URL
        for (const imageSource of room.images) {
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
        return NextResponse.json({ error: 'No images found for this room' }, { status: 400 });
      }
    }

    if (imageBuffers.length === 0) {
      return NextResponse.json({ error: 'No valid images provided' }, { status: 400 });
    }

    console.log(`Processing add-on search for room ${roomId} with ${imageBuffers.length} images`);

    // Get the pricing sheet for the provider to check for add-on rules
    const pricingSheet = await getPricingSheetByProviderId(providerId);
    
    if (!pricingSheet || !pricingSheet.rules || pricingSheet.rules.length === 0) {
      return NextResponse.json({ 
        message: 'No add-on rules found for this provider',
        addOns: [] 
      });
    }

    // Process images (resize and compress)
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

    // Array to store found add-ons
    const foundAddOns = [];

    // For each rule, ask Claude if it applies to this room
    for (const rule of pricingSheet.rules) {
      // Create the system message for add-on detection
      const systemMessage = `You are an expert in interior design and home renovation. Your task is to analyze room images and determine if specific conditions apply that would affect pricing.

IMPORTANT INSTRUCTIONS:
1. Carefully examine all provided images of the room.
2. Determine if the following condition applies: "${rule.condition}"
3. Your response must start with either "YES" or "NO" followed by a brief explanation.
4. Be specific about what you see in the images that supports your determination.
5. If you're uncertain, err on the side of caution and respond with "NO".`;

      // Create the user message with images
      const userMessage = {
        role: 'user' as const,
        content: [
          {
            type: 'text' as const,
            text: `Based on these room images, does this condition apply: "${rule.condition}"? Please respond with YES or NO followed by a brief explanation.`
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
        max_tokens: 300, // Limit response size
        system: systemMessage,
        messages: [userMessage]
      });

      // Extract the assistant's response
      let claudeResponse = '';
      for (const block of response.content) {
        if (block.type === 'text') {
          claudeResponse += block.text;
          break;
        }
      }

      console.log(`Claude's response for condition "${rule.condition}": ${claudeResponse}`);

      // Check if Claude's response indicates the condition applies
      if (claudeResponse.trim().toUpperCase().startsWith('YES')) {
        console.log(`Add-on condition applies: ${rule.condition}`);
        
        // Add this as a found add-on
        foundAddOns.push({
          name: rule.condition,
          price: rule.amount,
          roomId: roomId,
          explanation: claudeResponse.trim()
        });
      }
    }

    // Return the found add-ons
    return NextResponse.json({ 
      addOns: foundAddOns
    });

  } catch (error) {
    console.error('Error searching for add-ons:', error);
    return NextResponse.json(
      { error: 'Failed to search for add-ons' },
      { status: 500 }
    );
  }
}
