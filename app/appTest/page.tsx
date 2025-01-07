/*'use client';

import React, { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc, setDoc, Timestamp, collection } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Timestamp;
};

const AppTest: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const firestore = getFirestore(app);

  // Generate or retrieve session ID
  useEffect(() => {
    const storedSessionId = sessionStorage.getItem('chatSessionId'); // Use session storage
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      const newSessionId = generateSessionId();
      sessionStorage.setItem('chatSessionId', newSessionId);
      setSessionId(newSessionId);
    }
  }, []);

  // Load chat history from Firestore
  useEffect(() => {
    const loadChatHistory = async () => {
      if (sessionId) {
        const chatHistoryRef = doc(firestore, 'chatHistory', sessionId);
        const chatHistorySnap = await getDoc(chatHistoryRef);

        if (chatHistorySnap.exists()) {
          const data = chatHistorySnap.data();
          const loadedMessages = data.messages.map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp
          }));
          setMessages(loadedMessages);
        }
      }
    };
    loadChatHistory();
  }, [sessionId, firestore]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || !sessionId) return;

    const newMessage: Message = { role: 'user', content: userInput, timestamp: Timestamp.now() };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/anthropic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userInput,
          sessionId: sessionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Anthropic API request failed');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response.content[0].text,
        timestamp: Timestamp.now(),
      };

      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSessionId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI Chatbot</h1>

      <div className="mb-4 h-96 overflow-y-auto border rounded p-2">
        {messages.sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis()).map((msg, index) => (
          <div
            key={index}
            className={`mb-2 p-2 rounded ${msg.role === 'user' ? 'bg-blue-100' : 'bg-green-100'}`}
          >
            <b>{msg.role === 'user' ? 'You' : 'AI'}:</b> {msg.content}
          </div>
        ))}
        {isLoading && <div className="text-gray-500 italic">Generating response...</div>}
      </div>

      <div className="flex">
        <input
          type="text"
          value={userInput}
          onChange={handleInputChange}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
          className="flex-grow border rounded p-2 mr-2"
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button onClick={handleSendMessage} className="bg-blue-500 text-white rounded p-2" disabled={isLoading || !userInput.trim()}>
          Send
        </button>
      </div>
    </div>
  );
};

export default AppTest;
*/