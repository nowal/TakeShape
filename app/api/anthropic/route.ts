/*import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { db } from '../../lib/firebase'; // Import db from your firebase module
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, sessionId } = body;

    // Validate sessionId (in a real app, you'd have more robust validation)
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Get a reference to the chat history document
    const chatHistoryRef = doc(db, 'chatHistory', sessionId);
    const chatHistorySnap = await getDoc(chatHistoryRef);

    let currentMessages = [];
    if (chatHistorySnap.exists()) {
      currentMessages = chatHistorySnap.data().messages || [];
    }

    // Add the new user message to the messages array
    const newMessage = {
      role: 'user',
      content: message,
      timestamp: Timestamp.now(),
    };
    const updatedMessages = [...currentMessages, newMessage];

    // Update the chat history in Firestore
    await setDoc(chatHistoryRef, {
      sessionId: sessionId,
      messages: updatedMessages,
    }, { merge: true });

    // Format the prompt with history
    let fullPrompt = "";
    updatedMessages.forEach((msg: { role: string; content: string; }) => {
      if (msg.role == 'user') {
        fullPrompt += `\n\nHuman: ${msg.content}`
      } else if (msg.role == 'assistant') {
        fullPrompt += `\n\nAssistant: ${msg.content}`
      }
    })
    fullPrompt += `\n\nHuman: ${message}\n\nAssistant: `;

    // Call the Anthropic API
    const anthropicResponse = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: fullPrompt
        }
      ]
    });

    let assistantContent = "";
    for (const contentBlock of anthropicResponse.content) {
      if (contentBlock.type === "text") {
        assistantContent += contentBlock.text;
      } else if (contentBlock.type === "image") {
        // Handle image content
        console.log("Received image content block:", contentBlock);
      } else if (contentBlock.type === "tool_use") {
        // Handle tool use content
        console.log("Received tool use content block:", contentBlock);
      }
    }

    // Add the Anthropic response to the chat history
    const assistantMessage = {
      role: 'assistant',
      content: assistantContent,
      timestamp: Timestamp.now(),
    };
    */