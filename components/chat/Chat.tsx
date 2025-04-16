'use client';

import React, { useState, useEffect } from 'react';
import ChatToggle from './ChatToggle';
import ChatPanel from './ChatPanel';
import ChatBubble from './ChatBubble';
import { getChatHistory, addChatMessage, ChatMessage } from '@/utils/firestore/session';
import { Timestamp } from 'firebase/firestore';

interface ChatProps {
  sessionId: string;
}

const Chat: React.FC<ChatProps> = ({ sessionId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load chat history when component mounts or sessionId changes
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!sessionId) return;
      
      try {
        const history = await getChatHistory(sessionId);
        setMessages(history);
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };

    loadChatHistory();
  }, [sessionId]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async (message: string) => {
    if (!sessionId || !message.trim()) return;

    try {
      setIsLoading(true);
      
      // Optimistically update UI with user message
      const userMessage: ChatMessage = {
        role: 'user',
        content: message,
        timestamp: Timestamp.now()
      };
      
      setMessages(prev => [...prev, userMessage]);

      // Save message to Firestore
      await addChatMessage(sessionId, message, 'user');

      // Get current context (e.g., active room, etc.)
      const context = '';  // This could be populated with relevant context

      // Send message to API
      const response = await fetch('/api/anthropic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sessionId,
          context
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Update UI with assistant response
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: Timestamp.now()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Save assistant response to Firestore
      await addChatMessage(sessionId, data.response, 'assistant');
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Show error message in chat
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again later.',
        timestamp: Timestamp.now()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert messages to ensure timestamp is always a Timestamp object
  const normalizeMessages = () => {
    return messages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp instanceof Timestamp 
        ? msg.timestamp 
        : Timestamp.fromDate(msg.timestamp as Date)
    }));
  };

  return (
    <>
      <ChatToggle onToggle={handleToggle} isOpen={isOpen} />
      <ChatPanel
        isOpen={isOpen}
        sessionId={sessionId}
        messages={normalizeMessages()}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </>
  );
};

export default Chat;
