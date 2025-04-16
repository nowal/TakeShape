// /app/api/anthropic/route.ts
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { 
  addChatMessage, 
  getChatHistory, 
  getSession, 
  createSession, 
  ChatMessage 
} from '@/utils/firestore/session';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message, sessionId, context } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Check if session exists, create if it doesn't
    let session = await getSession(sessionId);
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
    
    Be friendly, helpful, and concise in your responses. If the user asks about technical details you're unsure of,
    you can explain that you're an assistant for the application and can help with general usage questions.`;

    // Create the messages array for the API request
    const messages = chatHistory.map((msg: ChatMessage) => ({
      role: msg.role,
      content: msg.content
    }));

    // Add the new user message to the array
    messages.push({
      role: 'user',
      content: message
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
