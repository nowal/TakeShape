// /app/appTest/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getFirestore, doc, getDoc, Timestamp } from 'firebase/firestore';
import app from '@/lib/firebase';
import { Send } from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Timestamp;
};

const DEFAULT_PAINTER_ID = 'Zqq2sQOPV9bDLYm7PBgH';

const AppTest: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [quotingSchema, setQuotingSchema] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const db = getFirestore(app);

  // Fetch quoting schema when component mounts
  useEffect(() => {
    const fetchQuotingSchema = async () => {
      try {
        const painterRef = doc(db, 'painters', DEFAULT_PAINTER_ID);
        const painterSnap = await getDoc(painterRef);
        
        if (painterSnap.exists()) {
          const data = painterSnap.data();
          setQuotingSchema(data.quotingSchema);
          
          // If this is a new session, send initial message
          if (!sessionStorage.getItem('chatSessionId')) {
            const initialMessage: Message = {
              role: 'assistant',
              content: 'Hello! I can help you get a painting quote. Would you like to get started?',
              timestamp: Timestamp.now()
            };
            setMessages([initialMessage]);
          }
        }
      } catch (error) {
        console.error('Error fetching quoting schema:', error);
      }
    };
    fetchQuotingSchema();
  }, [db]);

  useEffect(() => {
    const storedSessionId = sessionStorage.getItem('chatSessionId');
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      const newSessionId = Math.random().toString(36).substring(2, 15) + 
                          Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('chatSessionId', newSessionId);
      setSessionId(newSessionId);
    }
  }, []);

  useEffect(() => {
    const loadChatHistory = async () => {
      if (sessionId) {
        const chatHistoryRef = doc(db, 'chatHistory', sessionId);
        const chatHistorySnap = await getDoc(chatHistoryRef);

        if (chatHistorySnap.exists()) {
          const data = chatHistorySnap.data();
          setMessages(data.messages || []);
        }
      }
    };
    loadChatHistory();
  }, [sessionId, db]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || !sessionId) return;

    const newMessage: Message = { 
      role: 'user', 
      content: userInput.trim(), 
      timestamp: Timestamp.now() 
    };
    
    setMessages(prev => [...prev, newMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/anthropic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userInput,
          sessionId: sessionId,
          quotingSchema: quotingSchema
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        timestamp: Timestamp.now()
      }]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-xl flex flex-col h-[80vh]">
        {/* Chat Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-semibold">Get a Painting Quote</h2>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-pink text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="text-gray-500 italic">Typing...</div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 border-t">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 p-3 border rounded-full"
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !userInput.trim()}
              className="p-3 bg-pink text-white rounded-full hover:bg-pink-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppTest;