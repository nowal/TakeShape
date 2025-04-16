'use client';

import React from 'react';

interface ChatToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

const ChatToggle: React.FC<ChatToggleProps> = ({ isOpen, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-50 transition-all duration-300 ${
        isOpen ? 'bg-red-500 rotate-45' : 'bg-blue-500'
      }`}
      aria-label={isOpen ? 'Close chat' : 'Open chat'}
    >
      {isOpen ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      )}
    </button>
  );
};

export default ChatToggle;
