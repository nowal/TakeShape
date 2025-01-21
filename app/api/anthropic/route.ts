// /app/api/anthropic/route.ts
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getFirestore } from 'firebase/firestore';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import app from '@/lib/firebase';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const db = getFirestore(app);

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Timestamp;
}

export async function POST(req: Request) {
  try {
    const { message, sessionId, quotingSchema } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const chatHistoryRef = doc(db, 'chatHistory', sessionId);
    const chatHistorySnap = await getDoc(chatHistoryRef);
    
    let messages: Message[] = [];
    if (chatHistorySnap.exists()) {
      messages = chatHistorySnap.data().messages || [];
    }

    const newUserMessage: Message = {
      role: 'user',
      content: message,
      timestamp: Timestamp.now()
    };
    messages.push(newUserMessage);

    // Create a system message with the quoting schema
    const systemMessage = `You are a helpful assistant for a painting company. 
    Your role is to help customers get quotes for painting services.
    
    The quoting schema you should follow is:
    ${quotingSchema}
    
    Guide the user through the process of getting a quote by:
    1. Asking for necessary information based on the quoting schema
    2. Helping them understand what measurements are needed
    3. Calculating the final quote using the schema
    4. Being friendly and professional throughout the conversation
    
    If the user asks questions unrelated to getting a quote, you can answer them,
    but try to guide the conversation back to helping them get a quote if appropriate.`;

    const anthropicResponse = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 2000,
      system: systemMessage,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    });

    let assistantContent = '';
    for (const block of anthropicResponse.content) {
      if (block.type === 'text') {
        assistantContent += block.text;
      }
    }

    const newAssistantMessage: Message = {
      role: 'assistant',
      content: assistantContent,
      timestamp: Timestamp.now()
    };
    messages.push(newAssistantMessage);

    await setDoc(chatHistoryRef, {
      messages: messages
    }, { merge: true });

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