// Debug logging utility
const DebugLogger = {
  logs: [],
  maxLogs: 50,
  
  init: function() {
    // Create debug panel
    const debugPanel = document.createElement('div');
    debugPanel.className = 'debug-panel';
    debugPanel.id = 'debug-panel';
    document.body.appendChild(debugPanel);
    
    // Create toggle button
    const toggleButton = document.createElement('button');
    toggleButton.className = 'debug-toggle';
    toggleButton.textContent = 'Show Debug';
    toggleButton.onclick = this.togglePanel;
    document.body.appendChild(toggleButton);
    
    // Listen for embed events
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type && event.data.type.startsWith('takeshape_')) {
        this.log(`Event: ${event.data.type}`, event.data);
      }
    });
    
    this.log('Debug logger initialized');
  },
  
  log: function(message, data = null) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const logEntry = {
      timestamp,
      message,
      data
    };
    
    // Add to logs array
    this.logs.unshift(logEntry);
    
    // Trim logs if needed
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
    
    // Update panel if visible
    this.updatePanel();
    
    // Also log to console
    if (data) {
      console.log(`[${timestamp}] ${message}`, data);
    } else {
      console.log(`[${timestamp}] ${message}`);
    }
  },
  
  updatePanel: function() {
    const panel = document.getElementById('debug-panel');
    if (!panel) return;
    
    let html = '<h4>Debug Logs</h4>';
    
    this.logs.forEach(log => {
      html += `<div class="log-entry">`;
      html += `<span class="log-time">[${log.timestamp}]</span> `;
      html += `<span class="log-message">${log.message}</span>`;
      
      if (log.data) {
        html += `<pre class="log-data">${JSON.stringify(log.data, null, 2)}</pre>`;
      }
      
      html += `</div>`;
    });
    
    panel.innerHTML = html;
  },
  
  togglePanel: function() {
    const panel = document.getElementById('debug-panel');
    if (panel.classList.contains('visible')) {
      panel.classList.remove('visible');
      this.textContent = 'Show Debug';
    } else {
      panel.classList.add('visible');
      this.textContent = 'Hide Debug';
    }
  },
  
  clear: function() {
    this.logs = [];
    this.updatePanel();
  }
};

// Utility functions
const Utils = {
  // Get URL parameters
  getUrlParams: function() {
    const params = {};
    const queryString = window.location.search.substring(1);
    const pairs = queryString.split('&');
    
    for (let i = 0; i < pairs.length; i++) {
      if (!pairs[i]) continue;
      
      const pair = pairs[i].split('=');
      params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    
    return params;
  },
  
  // Set active navigation link
  setActiveNavLink: function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav ul li a');
    
    navLinks.forEach(link => {
      const linkPage = link.getAttribute('href').split('/').pop();
      if (linkPage === currentPage) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize debug logger
  DebugLogger.init();
  
  // Set active navigation link
  Utils.setActiveNavLink();
  
  // Log page load
  DebugLogger.log(`Page loaded: ${window.location.pathname}`);
  
  // Check for embed script
  setTimeout(() => {
    if (window.TakeShapeEmbed) {
      DebugLogger.log('TakeShapeEmbed script detected', window.TakeShapeEmbed);
    }
    
    // Check for chat widget
    const chatElements = document.querySelectorAll('.takeshape-chat-widget');
    if (chatElements.length > 0) {
      DebugLogger.log('Chat widget detected', { count: chatElements.length });
    }
  }, 1000);
  
  // Apply URL parameters to embed if present
  const params = Utils.getUrlParams();
  if (params.painterId) {
    DebugLogger.log('URL parameter detected: painterId', params.painterId);
    
    // Find embed script and update data-painter-id attribute
    const embedScripts = document.querySelectorAll('script[src*="site-embed.js"]');
    embedScripts.forEach(script => {
      script.setAttribute('data-painter-id', params.painterId);
      DebugLogger.log('Updated painter ID on embed script', params.painterId);
    });
  }
  
  if (params.enableChat) {
    DebugLogger.log('URL parameter detected: enableChat', params.enableChat);
    
    // Find embed script and update data-enable-chat attribute
    const embedScripts = document.querySelectorAll('script[src*="site-embed.js"]');
    embedScripts.forEach(script => {
      script.setAttribute('data-enable-chat', params.enableChat);
      DebugLogger.log('Updated enableChat on embed script', params.enableChat);
    });
  }
});
