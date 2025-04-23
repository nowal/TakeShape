# TakeShape Test Site

This is a lightweight test site for testing the TakeShape embed scripts in a realistic environment. It simulates a home service provider's website with multiple pages and includes both the site-wide embed script and the contact form embed.

## Purpose

This test site allows you to:

1. Test the site-wide embed script (`site-embed.js`) across multiple pages
2. Test the contact form embed script (`embed.js`) on the contact page
3. Debug and monitor events with the built-in debug panel
4. Test different configurations via URL parameters
5. Simulate a real user journey through a website

## Pages

- **Home**: Landing page with general information
- **About**: Information about the company
- **Services**: Details about the services offered
- **Contact**: Contact information and forms, including the TakeShape embed

## Features

### Site-wide Embed Script

The site-wide embed script is included on all pages with the following configuration:

```html
<script 
  src="/site-embed.js" 
  data-painter-id="9IsuIup4lcqZB2KHd4yh"
  data-enable-chat="true"
  data-primary-color="#ff385c"
  data-font-family="Arial, sans-serif"
  data-position="bottom-right">
</script>
```

### Contact Form Embed

The contact page includes the TakeShape embed for the contact form:

```html
<div id="takeshape-embed-container"></div>

<script src="/embed.js"></script>
<script>
  TakeShapeEmbed.init({
    container: 'takeshape-embed-container',
    primaryColor: '#ff385c',
    secondaryColor: '#007aff',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    fontFamily: 'Arial, sans-serif',
    borderRadius: '8px',
    enableChat: true
  });
</script>
```

### Debug Panel

The test site includes a debug panel that logs events and provides information about the embed scripts. To use it:

1. Click the "Show Debug" button in the bottom right corner of any page
2. View the logs in the debug panel
3. Click the button again to hide the panel

### URL Parameters

You can customize the embed scripts using URL parameters:

- `painterId`: Sets the painter ID for the site-wide embed script
- `enableChat`: Enables or disables the chat widget (true/false)
- `primaryColor`: Sets the primary color for the embed scripts (hex code)
- `position`: Sets the position of the chat widget (bottom-right, bottom-left, top-right, top-left)

Example:
```
/test-site/index.html?painterId=YOUR_PAINTER_ID&enableChat=true&primaryColor=%23ff0000&position=bottom-left
```

## How to Use

### Testing Session Tracking

1. Navigate through different pages of the site
2. Check the debug panel to see session events
3. Verify that the session ID is consistent across pages
4. Check the provider dashboard to see the session data

### Testing Chat Functionality

1. Enable chat using the URL parameter or default configuration
2. Open the chat widget by clicking the chat button
3. Send messages and verify responses
4. Check the debug panel for chat events
5. Verify that chat history is preserved across page navigation

### Testing Contact Form Embed

1. Go to the Contact page
2. Interact with the TakeShape embed form
3. Complete the form and submit it
4. Check the debug panel for form submission events
5. Verify that the submission appears in the provider dashboard

### Testing Different Configurations

1. Use URL parameters to test different configurations
2. Refresh the page to apply the new configuration
3. Verify that the changes are applied correctly
4. Check the debug panel for configuration information

## Development

If you need to modify the test site, you can edit the HTML, CSS, and JavaScript files directly. The site is built with plain HTML, CSS, and JavaScript for simplicity and ease of maintenance.

- HTML files: `/public/test-site/*.html`
- CSS: `/public/test-site/css/styles.css`
- JavaScript: `/public/test-site/js/main.js`

## Running the Test Site

The test site is served by the Next.js development server. To run it:

1. Start the Next.js development server: `npm run dev`
2. Open a browser and navigate to: `http://localhost:3000/test-site/index.html`
