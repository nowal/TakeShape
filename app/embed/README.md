# TakeShape Room Scanner Embed

This module provides an embeddable version of the TakeShape Room Scanner that can be integrated into any website. It allows your clients to use the room scanning and quoting functionality directly on their own websites.

## Features

- **Fully Customizable**: Change colors, fonts, and styling to match your client's brand
- **Responsive Design**: Works on all devices, from mobile to desktop
- **Easy Integration**: Simple iframe or JavaScript embed options
- **Event Callbacks**: Receive data when users complete the process
- **Seamless Experience**: Users stay on your client's website throughout the process

## Integration Options

There are two main ways to integrate the Room Scanner into a website:

### 1. Simple iframe Embed

The simplest way to embed the Room Scanner is with an iframe:

```html
<iframe 
  src="https://your-takeshape-domain.com/embed/demo?primaryColor=%23ff385c" 
  width="100%" 
  height="700" 
  style="border: none; border-radius: 8px;" 
  allowfullscreen
></iframe>
```

### 2. JavaScript Embed (Recommended)

For more control and features, use the JavaScript embed:

```html
<!-- 1. Add the embed script -->
<script src="https://your-takeshape-domain.com/embed.js"></script>

<!-- 2. Add a container for the embed -->
<div id="takeshape-embed-container"></div>

<!-- 3. Initialize the embed -->
<script>
  TakeShapeEmbed.init({
    container: 'takeshape-embed-container',
    primaryColor: '#ff385c',
    height: '700px'
  });
</script>
```

## Customization Options

You can customize the appearance of the embed by passing options to the `TakeShapeEmbed.init()` function or as URL parameters in the iframe src:

| Option | Description | Default |
|--------|-------------|---------|
| `primaryColor` | Main color for buttons and accents | `#ff385c` |
| `secondaryColor` | Secondary color for highlights | `#007aff` |
| `backgroundColor` | Background color | `#ffffff` |
| `textColor` | Text color | `#333333` |
| `fontFamily` | Font family to use | System fonts |
| `borderRadius` | Border radius for UI elements | `8px` |
| `boxShadow` | Box shadow for the embed | `0 2px 8px rgba(0, 0, 0, 0.1)` |
| `width` | Width of the embed | `100%` |
| `height` | Height of the embed | `700px` |

## Event Callbacks

When using the JavaScript embed, you can add callback functions to handle events:

```javascript
TakeShapeEmbed.init({
  container: 'takeshape-embed-container',
  primaryColor: '#ff385c',
  height: '700px',
  onComplete: function(data) {
    // Handle completion event
    console.log('Quote accepted:', data);
    // data contains quote items, total amount, and timestamp
  },
  onError: function(error) {
    // Handle error event
    console.error('Error:', error.message);
  }
});
```

## Example Pages

We've included example pages to help you get started:

1. `/embed-example.html` - Interactive example with customization options
2. `/embed-test.html` - Multiple examples showing different integration methods

## Best Practices

- **Height**: Set a minimum height of 600px for the best user experience
- **Width**: 100% width works well for responsive designs, but you can also use a fixed width
- **Colors**: Use your client's brand colors for a seamless experience
- **Testing**: Test the embed on different devices and browsers
- **Callbacks**: Use callbacks to track completions and integrate with your client's systems

## Troubleshooting

- **Camera Access**: The embed requires camera access, which may be blocked by some browsers or privacy settings
- **HTTPS**: Camera access requires HTTPS, so ensure your website uses HTTPS
- **Cross-Origin**: If embedding on a different domain, ensure your CORS settings allow it
- **Mobile**: On mobile devices, ensure the embed has enough space to be usable

## Support

If you encounter any issues or have questions, please contact our support team.
