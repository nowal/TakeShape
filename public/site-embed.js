/**
 * TakeShape Site Embed Script
 * 
 * This script adds chat functionality and session tracking to any website.
 * 
 * Usage:
 * <script 
 *   src="https://your-takeshape-domain.com/site-embed.js" 
 *   data-painter-id="YOUR_PAINTER_ID"
 *   data-enable-chat="true"
 *   data-primary-color="#ff385c"
 *   data-font-family="Arial, sans-serif"
 *   data-position="bottom-right">
 * </script>
 */

(function(window) {
  'use strict';
  
  // Get the script tag
  const scriptTag = document.currentScript;
  
  // Base URL for API calls
  const BASE_URL = window.location.origin;
  
  // Extract configuration from data attributes
  const config = {
    painterId: scriptTag.getAttribute('data-painter-id'),
    enableChat: scriptTag.getAttribute('data-enable-chat') === 'true',
    primaryColor: scriptTag.getAttribute('data-primary-color') || '#ff385c',
    fontFamily: scriptTag.getAttribute('data-font-family') || 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
    position: scriptTag.getAttribute('data-position') || 'bottom-right',
    textColor: scriptTag.getAttribute('data-text-color') || '#333333',
    backgroundColor: scriptTag.getAttribute('data-background-color') || '#ffffff'
  };
  
  // Validate required parameters
  if (!config.painterId) {
    console.error('TakeShape Site Embed: data-painter-id is required');
    return;
  }
  
  // TakeShape Site Embed object
  const TakeShapeSiteEmbed = {
    sessionId: null,
    isInitialized: false,
    chatContainer: null,
    chatToggle: null,
    chatPanel: null,
    isOpen: false,
    messages: [],
    isLoading: false,
    
    /**
     * Initialize the embed
     */
    init: async function() {
      if (this.isInitialized) return;
      
      try {
        // Get or create session
        await this.initSession();
        
        // Create chat UI only if enabled
        if (config.enableChat) {
          this.createChatUI();
          this.applyStyles();
        }
        
        this.isInitialized = true;
      } catch (error) {
        console.error('Error initializing TakeShape Site Embed:', error);
      }
    },
    
    /**
     * Initialize session
     */
    initSession: async function() {
      // Check if session ID exists in localStorage
      let sessionId = localStorage.getItem('sessionId');
      
      if (!sessionId) {
        // Create a new session ID using UUID v4
        sessionId = this.generateUUID();
        localStorage.setItem('sessionId', sessionId);
        
        // Create session in Firestore
        await this.createSession(sessionId);
        
        // Associate session with painter
        await this.addSessionToPainter(sessionId, config.painterId);
      } else {
        // Update session activity
        await this.updateSessionActivity(sessionId);
      }
      
      this.sessionId = sessionId;
      return sessionId;
    },
    
    /**
     * Generate a UUID v4
     * @returns {string} A UUID v4 string
     */
    generateUUID: function() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    },
    
    /**
     * Create a session in Firestore
     * @param {string} sessionId - The session ID
     */
    createSession: async function(sessionId) {
      try {
        const response = await fetch(`${BASE_URL}/api/sessions/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to create session: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error creating session:', error);
        throw error;
      }
    },
    
    /**
     * Update session activity
     * @param {string} sessionId - The session ID
     */
    updateSessionActivity: async function(sessionId) {
      try {
        const response = await fetch(`${BASE_URL}/api/sessions/update-activity`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to update session activity: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error updating session activity:', error);
        // Don't throw here, just log the error
      }
    },
    
    /**
     * Add session to painter
     * @param {string} sessionId - The session ID
     * @param {string} painterId - The painter ID
     */
    addSessionToPainter: async function(sessionId, painterId) {
      try {
        const response = await fetch(`${BASE_URL}/api/painter/addSession`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId, painterId }),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to add session to painter: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error adding session to painter:', error);
        throw error;
      }
    },
    
    /**
     * Create chat UI
     */
    createChatUI: function() {
      // Create container for chat components
      this.chatContainer = document.createElement('div');
      this.chatContainer.className = 'takeshape-chat-container';
      document.body.appendChild(this.chatContainer);
      
      // Create chat toggle button
      this.createChatToggle();
      
      // Create chat panel
      this.createChatPanel();
      
      // Load chat history
      this.loadChatHistory();
    },
    
    /**
     * Create chat toggle button
     */
    createChatToggle: function() {
      this.chatToggle = document.createElement('button');
      this.chatToggle.className = 'takeshape-chat-toggle';
      this.chatToggle.setAttribute('aria-label', 'Open chat');
      
      // Add chat icon
      this.chatToggle.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      `;
      
      // Add event listener
      this.chatToggle.addEventListener('click', () => this.toggleChat());
      
      // Add to container
      this.chatContainer.appendChild(this.chatToggle);
    },
    
    /**
     * Create chat panel
     */
    createChatPanel: function() {
      this.chatPanel = document.createElement('div');
      this.chatPanel.className = 'takeshape-chat-panel';
      
      // Create header
      const header = document.createElement('div');
      header.className = 'takeshape-chat-header';
      header.innerHTML = '<h3>Chat Assistant</h3>';
      
      // Create messages container
      const messagesContainer = document.createElement('div');
      messagesContainer.className = 'takeshape-chat-messages';
      this.messagesContainer = messagesContainer;
      
      // Create input area
      const inputArea = document.createElement('form');
      inputArea.className = 'takeshape-chat-input-area';
      
      const inputWrapper = document.createElement('div');
      inputWrapper.className = 'takeshape-chat-input-wrapper';
      
      const textarea = document.createElement('textarea');
      textarea.className = 'takeshape-chat-input';
      textarea.placeholder = 'Type your message...';
      textarea.rows = 1;
      this.chatInput = textarea;
      
      // Handle textarea height
      textarea.addEventListener('input', (e) => {
        // Reset height to auto to get the correct scrollHeight
        e.target.style.height = 'auto';
        
        // Set the height to scrollHeight + 2px for border
        const newHeight = Math.min(e.target.scrollHeight, 150);
        e.target.style.height = `${newHeight}px`;
      });
      
      // Handle Enter key to submit (Shift+Enter for new line)
      textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
      
      const sendButton = document.createElement('button');
      sendButton.className = 'takeshape-chat-send-button';
      sendButton.type = 'submit';
      sendButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      `;
      
      // Add event listener
      inputArea.addEventListener('submit', (e) => {
        e.preventDefault();
        this.sendMessage();
      });
      
      // Assemble input area
      inputWrapper.appendChild(textarea);
      inputWrapper.appendChild(sendButton);
      inputArea.appendChild(inputWrapper);
      
      // Assemble panel
      this.chatPanel.appendChild(header);
      this.chatPanel.appendChild(messagesContainer);
      this.chatPanel.appendChild(inputArea);
      
      // Add to container
      this.chatContainer.appendChild(this.chatPanel);
    },
    
    /**
     * Toggle chat open/closed
     */
    toggleChat: function() {
      this.isOpen = !this.isOpen;
      
      if (this.isOpen) {
        this.chatPanel.classList.add('open');
        this.chatToggle.classList.add('open');
        this.chatToggle.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        `;
        this.chatToggle.setAttribute('aria-label', 'Close chat');
        
        // Focus input
        setTimeout(() => {
          this.chatInput.focus();
        }, 300);
        
        // Scroll to bottom of messages
        this.scrollToBottom();
      } else {
        this.chatPanel.classList.remove('open');
        this.chatToggle.classList.remove('open');
        this.chatToggle.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        `;
        this.chatToggle.setAttribute('aria-label', 'Open chat');
      }
    },
    
    /**
     * Load chat history
     */
    loadChatHistory: async function() {
      if (!this.sessionId) return;
      
      try {
        const response = await fetch(`${BASE_URL}/api/sessions/chat-history?sessionId=${this.sessionId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to load chat history: ${response.status}`);
        }
        
        const data = await response.json();
        this.messages = data.chatHistory || [];
        
        // Render messages
        this.renderMessages();
      } catch (error) {
        console.error('Error loading chat history:', error);
        
        // Show welcome message if no history
        if (this.messages.length === 0) {
          this.messagesContainer.innerHTML = `
            <div class="takeshape-chat-welcome">
              <p>Hi there! How can I help you with your home improvement project?</p>
            </div>
          `;
        }
      }
    },
    
    /**
     * Render messages
     */
    renderMessages: function() {
      if (!this.messagesContainer) return;
      
      if (this.messages.length === 0) {
        this.messagesContainer.innerHTML = `
          <div class="takeshape-chat-welcome">
            <p>Hi there! How can I help you with your home improvement project?</p>
          </div>
        `;
        return;
      }
      
      this.messagesContainer.innerHTML = '';
      
      this.messages.forEach(message => {
        const messageEl = document.createElement('div');
        messageEl.className = `takeshape-chat-message ${message.role}`;
        
        const content = document.createElement('div');
        content.className = 'takeshape-chat-message-content';
        content.textContent = message.content;
        
        const timestamp = document.createElement('div');
        timestamp.className = 'takeshape-chat-message-timestamp';
        
        // Format timestamp
        const date = new Date(message.timestamp.seconds * 1000);
        timestamp.textContent = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageEl.appendChild(content);
        messageEl.appendChild(timestamp);
        
        this.messagesContainer.appendChild(messageEl);
      });
      
      // Scroll to bottom
      this.scrollToBottom();
    },
    
    /**
     * Scroll to bottom of messages
     */
    scrollToBottom: function() {
      if (this.messagesContainer) {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
      }
    },
    
    /**
     * Send a message
     */
    sendMessage: async function() {
      if (!this.chatInput || !this.sessionId) return;
      
      const message = this.chatInput.value.trim();
      if (!message || this.isLoading) return;
      
      // Clear input
      this.chatInput.value = '';
      this.chatInput.style.height = 'auto';
      
      // Set loading state
      this.isLoading = true;
      
      try {
        // Optimistically add user message to UI
        const userMessage = {
          role: 'user',
          content: message,
          timestamp: { seconds: Date.now() / 1000 }
        };
        
        this.messages.push(userMessage);
        this.renderMessages();
        
        // Send message to API
        const response = await fetch(`${BASE_URL}/api/anthropic`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            sessionId: this.sessionId,
            context: ''
          }),
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Add assistant response to UI
        const assistantMessage = {
          role: 'assistant',
          content: data.response,
          timestamp: { seconds: Date.now() / 1000 }
        };
        
        this.messages.push(assistantMessage);
        this.renderMessages();
      } catch (error) {
        console.error('Error sending message:', error);
        
        // Show error message in chat
        const errorMessage = {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again later.',
          timestamp: { seconds: Date.now() / 1000 }
        };
        
        this.messages.push(errorMessage);
        this.renderMessages();
      } finally {
        this.isLoading = false;
      }
    },
    
    /**
     * Apply styles to chat components
     */
    applyStyles: function() {
      // Create style element
      const style = document.createElement('style');
      style.textContent = `
        .takeshape-chat-container {
          font-family: ${config.fontFamily};
          color: ${config.textColor};
          --primary-color: ${config.primaryColor};
          --background-color: ${config.backgroundColor};
          --text-color: ${config.textColor};
          position: fixed;
          z-index: 9999;
          ${this.getPositionStyles()}
        }
        
        .takeshape-chat-toggle {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background-color: var(--primary-color);
          color: white;
          border: none;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease, background-color 0.3s ease;
        }
        
        .takeshape-chat-toggle:hover {
          transform: scale(1.05);
        }
        
        .takeshape-chat-toggle.open {
          background-color: #e74c3c;
          transform: rotate(45deg);
        }
        
        .takeshape-chat-panel {
          position: absolute;
          bottom: 70px;
          ${this.getPositionStyles(true)}
          width: 320px;
          height: 450px;
          background-color: var(--background-color);
          border-radius: 12px;
          box-shadow: 0 5px 25px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: opacity 0.3s ease, transform 0.3s ease;
          opacity: 0;
          transform: scale(0.95);
          pointer-events: none;
        }
        
        .takeshape-chat-panel.open {
          opacity: 1;
          transform: scale(1);
          pointer-events: all;
        }
        
        .takeshape-chat-header {
          padding: 16px;
          background-color: var(--primary-color);
          color: white;
        }
        
        .takeshape-chat-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }
        
        .takeshape-chat-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .takeshape-chat-welcome {
          text-align: center;
          color: #666;
          margin: auto 0;
          padding: 20px;
        }
        
        .takeshape-chat-message {
          display: flex;
          flex-direction: column;
          max-width: 80%;
        }
        
        .takeshape-chat-message.user {
          align-self: flex-end;
        }
        
        .takeshape-chat-message.assistant {
          align-self: flex-start;
        }
        
        .takeshape-chat-message-content {
          padding: 10px 14px;
          border-radius: 18px;
          word-break: break-word;
          white-space: pre-wrap;
        }
        
        .takeshape-chat-message.user .takeshape-chat-message-content {
          background-color: var(--primary-color);
          color: white;
          border-bottom-right-radius: 4px;
        }
        
        .takeshape-chat-message.assistant .takeshape-chat-message-content {
          background-color: #f1f1f1;
          color: #333;
          border-bottom-left-radius: 4px;
        }
        
        .takeshape-chat-message-timestamp {
          font-size: 11px;
          margin-top: 4px;
          opacity: 0.7;
        }
        
        .takeshape-chat-message.user .takeshape-chat-message-timestamp {
          text-align: right;
          color: #666;
        }
        
        .takeshape-chat-message.assistant .takeshape-chat-message-timestamp {
          text-align: left;
          color: #666;
        }
        
        .takeshape-chat-input-area {
          padding: 12px;
          border-top: 1px solid #eee;
        }
        
        .takeshape-chat-input-wrapper {
          position: relative;
          display: flex;
        }
        
        .takeshape-chat-input {
          flex: 1;
          padding: 12px 40px 12px 12px;
          border: 1px solid #ddd;
          border-radius: 20px;
          resize: none;
          font-family: inherit;
          font-size: 14px;
          line-height: 1.4;
          max-height: 150px;
          outline: none;
        }
        
        .takeshape-chat-input:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.1);
        }
        
        .takeshape-chat-send-button {
          position: absolute;
          right: 8px;
          bottom: 8px;
          background: none;
          border: none;
          color: var(--primary-color);
          cursor: pointer;
          padding: 6px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .takeshape-chat-send-button:hover {
          background-color: rgba(var(--primary-color-rgb), 0.1);
        }
        
        @media (max-width: 480px) {
          .takeshape-chat-panel {
            width: calc(100vw - 32px);
            max-width: 320px;
          }
        }
      `;
      
      // Add RGB version of primary color for opacity
      const primaryRgb = this.hexToRgb(config.primaryColor);
      if (primaryRgb) {
        style.textContent = style.textContent.replace('--primary-color-rgb', primaryRgb);
      }
      
      // Add style to head
      document.head.appendChild(style);
    },
    
    /**
     * Get position styles based on config
     * @param {boolean} isPanel - Whether styles are for panel
     * @returns {string} CSS position styles
     */
    getPositionStyles: function(isPanel = false) {
      const position = config.position || 'bottom-right';
      
      switch (position) {
        case 'bottom-right':
          return isPanel ? 'right: 0;' : 'bottom: 20px; right: 20px;';
        case 'bottom-left':
          return isPanel ? 'left: 0;' : 'bottom: 20px; left: 20px;';
        case 'top-right':
          return isPanel ? 'right: 0; bottom: auto; top: 70px;' : 'top: 20px; right: 20px;';
        case 'top-left':
          return isPanel ? 'left: 0; bottom: auto; top: 70px;' : 'top: 20px; left: 20px;';
        default:
          return isPanel ? 'right: 0;' : 'bottom: 20px; right: 20px;';
      }
    },
    
    /**
     * Convert hex color to RGB
     * @param {string} hex - Hex color code
     * @returns {string} RGB values as "r, g, b"
     */
    hexToRgb: function(hex) {
      // Remove # if present
      hex = hex.replace('#', '');
      
      // Parse hex values
      const bigint = parseInt(hex, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      
      return `${r}, ${g}, ${b}`;
    }
  };
  
  // Initialize the embed
  TakeShapeSiteEmbed.init();
  
  // Expose the TakeShapeSiteEmbed object to the global scope
  window.TakeShapeSiteEmbed = TakeShapeSiteEmbed;
  
})(window);
