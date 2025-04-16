'use client';

import React, { useState, useRef, useEffect } from 'react';
import ChatBubble, { Message } from './ChatBubble';
import { Timestamp } from 'firebase/firestore';

interface ChatPanelProps {
  isOpen: boolean;
  sessionId: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Timestamp;
  }>;
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  isOpen,
  sessionId,
  messages,
  onSendMessage,
  isLoading
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages change or panel opens
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  // Handle textarea height
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Reset height to auto to get the correct scrollHeight
    e.target.style.height = 'auto';
    
    // Set the height to scrollHeight + 2px for border
    const newHeight = Math.min(e.target.scrollHeight, 150);
    e.target.style.height = `${newHeight}px`;
  };

  // Handle Enter key to submit (Shift+Enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Convert Firestore Timestamp to Message format
  const formatMessages = (): Message[] => {
    return messages.map((msg, index) => ({
      id: `${index}-${msg.timestamp.toMillis()}`,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp.toMillis()
    }));
  };

  return (
    <div
      className={`fixed bottom-24 right-6 w-80 sm:w-96 h-[500px] bg-white rounded-lg shadow-xl flex flex-col z-40 transition-all duration-300 ${
        isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
      }`}
    >
      {/* Header */}
      <div className="bg-blue-500 text-white p-4 rounded-t-lg">
        <h3 className="font-medium">Chat Assistant</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        {formatMessages().length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>Hi there! How can I help you with your 3D room scanning?</p>
          </div>
        ) : (
          formatMessages().map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[44px] max-h-[150px]"
            disabled={isLoading}
            rows={1}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`absolute right-2 bottom-2 p-2 rounded-full ${
              isLoading || !input.trim() ? 'text-gray-400' : 'text-blue-500 hover:bg-blue-100'
            }`}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;
