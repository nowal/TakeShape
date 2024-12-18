'use client';

import React, { useState } from 'react';

const AppTest: React.FC = () => {
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; content: string }[]
  >([]);
  const [userInput, setUserInput] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const handleSendMessage = async () => {
    // Add user message to the chat
    setMessages([...messages, { role: 'user', content: userInput }]);
    setUserInput(''); // Clear the input field

    try {
      // 1. Call your backend API to send the message to Gemini
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }), // Send the chat history to Gemini
      });

      if (!response.ok) {
        throw new Error(`Gemini API request failed: ${response.status}`);
      }

      // 2. Get the response from Gemini
      const data = await response.json();
      const geminiMessage = data.response; // Assuming your API returns a 'response' field

      // 3. Add Gemini's message to the chat
      setMessages([
        ...messages,
        { role: 'user', content: userInput },
        { role: 'assistant', content: geminiMessage },
      ]);
    } catch (error) {
      console.error('Error sending message to Gemini:', error);
      // Handle the error (e.g., display an error message to the user)
    }
  };

  return (
    <div>
      <h1>App Test</h1>

      {/* Chat interface */}
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <b>{msg.role}:</b> {msg.content}
          </div>
        ))}
      </div>

      <input type="text" value={userInput} onChange={handleInputChange} />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
};

export default AppTest;