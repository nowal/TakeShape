/**
 * Utility functions for the embed module
 */

/**
 * Parse URL parameters for customization options
 * @returns Object with customization options
 */
export function parseUrlParams(): Record<string, string | boolean> {
  if (typeof window === 'undefined') {
    return {};
  }
  
  const params = new URLSearchParams(window.location.search);
  const options: Record<string, string | boolean> = {};
  
  // Extract customization parameters
  const paramMap = {
    primaryColor: 'primaryColor',
    secondaryColor: 'secondaryColor',
    backgroundColor: 'backgroundColor',
    textColor: 'textColor',
    fontFamily: 'fontFamily',
    borderRadius: 'borderRadius',
    boxShadow: 'boxShadow',
  };
  
  // Process each parameter
  Object.entries(paramMap).forEach(([key, paramName]) => {
    const value = params.get(paramName);
    if (value) {
      try {
        // Decode URI component to handle special characters
        options[key] = decodeURIComponent(value);
      } catch (e) {
        console.error(`Error decoding parameter ${paramName}:`, e);
        // Use the raw value as fallback
        options[key] = value;
      }
    }
  });
  
  // Handle boolean parameters
  const enableChat = params.get('enableChat');
  if (enableChat !== null) {
    options.enableChat = enableChat === 'true';
  } else {
    options.enableChat = false; // Default to false
  }
  
  return options;
}

/**
 * Apply customization options to CSS variables
 * @param options Customization options
 */
export function applyCustomization(options: Record<string, string | boolean>): void {
  if (typeof document === 'undefined') {
    return;
  }
  
  // Map of option keys to CSS variable names
  const cssVarMap: Record<string, string> = {
    primaryColor: '--primary-color',
    secondaryColor: '--secondary-color',
    backgroundColor: '--background-color',
    textColor: '--text-color',
    fontFamily: '--font-family',
    borderRadius: '--border-radius',
    boxShadow: '--box-shadow',
  };
  
  // Set CSS variables on the document root
  const root = document.documentElement;
  
  Object.entries(options).forEach(([key, value]) => {
    // Skip non-string values (like enableChat boolean)
    if (typeof value !== 'string') return;
    
    const cssVar = cssVarMap[key];
    if (cssVar && value) {
      root.style.setProperty(cssVar, value);
      
      // Apply specific styles for certain variables
      if (key === 'primaryColor') {
        // Apply primary color to buttons
        root.style.setProperty('--submit-button-color', value);
        root.style.setProperty('--accept-quote-button-color', value);
        root.style.setProperty('--camera-button-color', value);
        
        // Update specific elements that might not use CSS variables
        const submitButtons = document.querySelectorAll('.submit-button-header');
        const acceptButtons = document.querySelectorAll('.accept-quote-button');
        const cameraButtons = document.querySelectorAll('.camera-button:not(.disabled)');
        
        submitButtons.forEach(button => {
          (button as HTMLElement).style.backgroundColor = value;
        });
        
        acceptButtons.forEach(button => {
          (button as HTMLElement).style.backgroundColor = value;
        });
        
        cameraButtons.forEach(button => {
          (button as HTMLElement).style.backgroundColor = value;
        });
      }
      
      if (key === 'textColor') {
        // Apply text color to quote total with higher specificity
        const quoteTotalLabel = document.querySelectorAll('.quote-view .quote-total-label');
        const quoteTotalAmount = document.querySelectorAll('.quote-view .quote-total-amount');
        const quoteTotal = document.querySelectorAll('.quote-view .quote-total');
        
        quoteTotalLabel.forEach(element => {
          (element as HTMLElement).style.color = value + ' !important';
        });
        
        quoteTotalAmount.forEach(element => {
          (element as HTMLElement).style.color = value + ' !important';
        });
        
        quoteTotal.forEach(element => {
          (element as HTMLElement).style.color = value + ' !important';
          (element as HTMLElement).style.backgroundColor = 'white !important';
        });
      }
      
      if (key === 'backgroundColor') {
        // Apply background color to quote total
        const quoteTotal = document.querySelectorAll('.quote-view .quote-total');
        
        quoteTotal.forEach(element => {
          (element as HTMLElement).style.backgroundColor = value + ' !important';
        });
      }
    }
  });
  
  // Apply font family directly to the body if specified
  if (options.fontFamily && typeof options.fontFamily === 'string') {
    document.body.style.fontFamily = options.fontFamily;
    
    // Also apply to the embed container to ensure it overrides any other styles
    const embedContainer = document.querySelector('.embed-container');
    if (embedContainer) {
      (embedContainer as HTMLElement).style.fontFamily = options.fontFamily;
    }
  }
  
  // Add a class to the body to indicate this is an embed
  document.body.classList.add('takeshape-embed');
  
  // Hide header and footer using JavaScript as well (belt and suspenders approach)
  const header = document.querySelector('header');
  const footer = document.querySelector('footer');
  
  if (header) {
    (header as HTMLElement).style.display = 'none';
  }
  
  if (footer) {
    (footer as HTMLElement).style.display = 'none';
  }
}

/**
 * Send a message to the parent window
 * @param action The action type
 * @param data Additional data to send
 */
export function sendMessageToParent(action: string, data?: any): void {
  if (typeof window === 'undefined' || window.parent === window) {
    return;
  }
  
  try {
    window.parent.postMessage({
      type: 'takeshape-embed',
      action,
      data
    }, '*');
  } catch (e) {
    console.error('Error sending message to parent:', e);
  }
}

/**
 * Resize the iframe to fit content
 * @param height The height to set
 */
export function resizeIframe(height?: number): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  // If height is not provided, use the document height
  const newHeight = height || document.documentElement.scrollHeight;
  
  sendMessageToParent('resize', { height: newHeight });
}

/**
 * Send a completion event to the parent window
 * @param data Data to send with the completion event
 */
export function sendCompletionEvent(data: any): void {
  sendMessageToParent('complete', data);
}

/**
 * Send an error event to the parent window
 * @param message Error message
 */
export function sendErrorEvent(message: string): void {
  sendMessageToParent('error', { message });
}

/**
 * Initialize the embed with customization from URL parameters
 * @returns The parsed options
 */
export function initializeEmbed(): Record<string, string | boolean> {
  if (typeof window === 'undefined') {
    return {};
  }
  
  // Parse URL parameters
  const options = parseUrlParams();
  
  // Apply customization
  applyCustomization(options);
  
  // Set up resize observer to handle iframe resizing
  const resizeObserver = new ResizeObserver(() => {
    resizeIframe();
  });
  
  // Observe the document body for size changes
  resizeObserver.observe(document.body);
  
  // Send initial resize event
  setTimeout(() => {
    resizeIframe();
  }, 500);
  
  return options;
}
