/**
 * Utility functions for image processing (resizing and compression)
 */

/**
 * Resizes and compresses an image blob to reduce file size
 * @param imageBlob - The original image blob
 * @param maxWidth - Maximum width of the resized image (default: 1024)
 * @param maxHeight - Maximum height of the resized image (default: 768)
 * @param quality - JPEG compression quality (0-1, default: 0.8)
 * @returns Promise that resolves to a new, smaller image blob
 */
export async function resizeAndCompressImage(
  imageBlob: Blob,
  maxWidth: number = 1024,
  maxHeight: number = 768,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      // Create an image element to load the blob
      const img = new Image();
      const objectUrl = URL.createObjectURL(imageBlob);
      
      img.onload = () => {
        // Release the object URL
        URL.revokeObjectURL(objectUrl);
        
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        // Only resize if the image is larger than the max dimensions
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          
          if (width > height) {
            // Landscape orientation
            width = maxWidth;
            height = Math.round(width / aspectRatio);
            
            // If height is still too large, adjust again
            if (height > maxHeight) {
              height = maxHeight;
              width = Math.round(height * aspectRatio);
            }
          } else {
            // Portrait or square orientation
            height = maxHeight;
            width = Math.round(height * aspectRatio);
            
            // If width is still too large, adjust again
            if (width > maxWidth) {
              width = maxWidth;
              height = Math.round(width / aspectRatio);
            }
          }
        }
        
        // Create a canvas to draw the resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        // Draw the image on the canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Draw with smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert canvas to blob with compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob from canvas'));
              return;
            }
            
            // Log the size reduction
            console.log(`Image processed: ${imageBlob.size} bytes → ${blob.size} bytes (${Math.round(blob.size / imageBlob.size * 100)}% of original)`);
            
            resolve(blob);
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load image'));
      };
      
      // Set the source to the blob URL to trigger loading
      img.src = objectUrl;
    } catch (error) {
      reject(error);
    }
  });
}
