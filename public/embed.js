/**
 * TakeShape Room Scanner Embed Script
 * 
 * This script makes it easy to embed the TakeShape Room Scanner into any website.
 * 
 * Usage:
 * 1. Include this script in your HTML:
 *    <script src="https://your-takeshape-domain.com/embed.js"></script>
 * 
 * 2. Add a container element where you want the embed to appear:
 *    <div id="takeshape-embed-container"></div>
 * 
 * 3. Initialize the embed with options:
 *    <script>
 *      TakeShapeEmbed.init({
 *        container: 'takeshape-embed-container',
 *        primaryColor: '#ff385c',
 *        height: '700px',
 *        enableChat: true
 *      });
 *    </script>
 */

(function(window) {
  'use strict';
  
  // Base URL for the embed
  const BASE_URL = window.location.origin + '/embed/demo';
  
  // Default options
  const DEFAULT_OPTIONS = {
    container: 'takeshape-embed-container',
    width: '100%',
    height: '700px',
    primaryColor: '#ff385c',
    secondaryColor: '#007aff',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    enableChat: false
  };
  
  // TakeShape Embed object
  const TakeShapeEmbed = {
    /**
     * Initialize the embed
     * @param {Object} userOptions - User provided options
     */
    init: function(userOptions) {
      // Merge user options with defaults
      const options = { ...DEFAULT_OPTIONS, ...userOptions };
      
      // Find the container element
      const container = document.getElementById(options.container);
      if (!container) {
        console.error(`TakeShape Embed: Container element with ID "${options.container}" not found.`);
        return;
      }
      
      // Build the URL with query parameters
      const url = this.buildUrl(options);
      
      // Create the iframe
      const iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.width = options.width;
      iframe.height = options.height;
      iframe.style.border = 'none';
      iframe.style.borderRadius = options.borderRadius;
      iframe.style.boxShadow = options.boxShadow;
      iframe.allowFullscreen = true;
      
      // Add the iframe to the container
      container.appendChild(iframe);
      
      // Set up message listener for iframe resizing
      window.addEventListener('message', function(event) {
        // Verify the message is from our embed
        if (event.data && event.data.type === 'takeshape-embed') {
          if (event.data.action === 'resize' && event.data.data && event.data.data.height) {
            iframe.height = event.data.data.height + 'px';
          }
          
          // Handle completion event
          if (event.data.action === 'complete' && typeof options.onComplete === 'function') {
            options.onComplete(event.data.data);
          }
          
          // Handle error event
          if (event.data.action === 'error' && typeof options.onError === 'function') {
            options.onError(event.data.data);
          }
        }
      });
      
      // Return the iframe for further manipulation
      return iframe;
    },
    
    /**
     * Build the URL with query parameters
     * @param {Object} options - Options for the embed
     * @returns {string} The URL with query parameters
     */
    buildUrl: function(options) {
      const params = new URLSearchParams();
      
      // Add customization parameters
      if (options.primaryColor) params.set('primaryColor', options.primaryColor);
      if (options.secondaryColor) params.set('secondaryColor', options.secondaryColor);
      if (options.backgroundColor) params.set('backgroundColor', options.backgroundColor);
      if (options.textColor) params.set('textColor', options.textColor);
      if (options.fontFamily) params.set('fontFamily', options.fontFamily);
      if (options.borderRadius) params.set('borderRadius', options.borderRadius.replace('px', ''));
      
      // Add chat parameter
      params.set('enableChat', options.enableChat ? 'true' : 'false');
      
      // Add any additional parameters
      if (options.params) {
        Object.entries(options.params).forEach(([key, value]) => {
          params.set(key, value);
        });
      }
      
      // Build the final URL
      return `${BASE_URL}?${params.toString()}`;
    }
  };
  
  // Expose the TakeShapeEmbed object to the global scope
  window.TakeShapeEmbed = TakeShapeEmbed;
  
})(window);
