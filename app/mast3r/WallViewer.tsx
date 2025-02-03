import React, { useEffect, useRef } from 'react';

interface WallSegment {
  points: number[][];
  local_points: number[][];
  transform: number[][];
  height: number;
  width: number;
}

interface WallViewerProps {
  wall: WallSegment;
}

const WallViewer: React.FC<WallViewerProps> = ({ wall }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!wall || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Setup canvas scaling
    const margin = 50;
    const scale = Math.min(
      (canvas.width - 2 * margin) / wall.width,
      (canvas.height - 2 * margin) / wall.height
    );
    
    // Create density map
    const densityMap = new Float32Array(canvas.width * canvas.height);
    
    // Process points in chunks to avoid stack overflow
    const CHUNK_SIZE = 1000;
    const processChunk = (startIdx: number) => {
      const endIdx = Math.min(startIdx + CHUNK_SIZE, wall.local_points.length);
      const points = wall.local_points.slice(startIdx, endIdx);

      // Find min values for this chunk
      let minX = Infinity;
      let minY = Infinity;
      for (let i = 0; i < points.length; i++) {
        minX = Math.min(minX, points[i][0]);
        minY = Math.min(minY, points[i][1]);
      }

      // Process points
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        const x = margin + (point[0] - minX) * scale;
        const y = margin + (point[1] - minY) * scale;
        
        if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
          const px = Math.floor(x);
          const py = Math.floor(y);
          
          for (let dx = -2; dx <= 2; dx++) {
            for (let dy = -2; dy <= 2; dy++) {
              const nx = px + dx;
              const ny = py + dy;
              if (nx >= 0 && nx < canvas.width && ny >= 0 && ny < canvas.height) {
                const dist = Math.sqrt(dx * dx + dy * dy);
                const intensity = 1 / (1 + dist);
                densityMap[ny * canvas.width + nx] += intensity;
              }
            }
          }
        }
      }

      // Process next chunk if available
      if (endIdx < wall.local_points.length) {
        requestAnimationFrame(() => processChunk(endIdx));
      } else {
        // All chunks processed, render the final result
        finalizeRendering();
      }
    };

    const finalizeRendering = () => {
      // Find max density
      let maxDensity = 0;
      for (let i = 0; i < densityMap.length; i++) {
        maxDensity = Math.max(maxDensity, densityMap[i]);
      }
      
      // Draw density map
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      for (let i = 0; i < densityMap.length; i++) {
        const intensity = Math.floor((densityMap[i] / maxDensity) * 255);
        const idx = i * 4;
        imageData.data[idx] = intensity;     // R
        imageData.data[idx + 1] = intensity; // G
        imageData.data[idx + 2] = intensity; // B
        imageData.data[idx + 3] = intensity > 20 ? 255 : 0; // A
      }
      ctx.putImageData(imageData, 0, 0);
      
      // Draw measurements
      ctx.strokeStyle = '#00ff00';
      ctx.fillStyle = '#00ff00';
      ctx.font = '14px Arial';
      ctx.lineWidth = 2;
      
      // Height measurement
      ctx.beginPath();
      ctx.moveTo(canvas.width - margin/2, margin);
      ctx.lineTo(canvas.width - margin/2, canvas.height - margin);
      ctx.stroke();
      
      // Add measurement ticks for height
      const tickLength = 10;
      for (let i = 0; i <= 5; i++) {
        const y = margin + (canvas.height - 2 * margin) * (i / 5);
        ctx.beginPath();
        ctx.moveTo(canvas.width - margin/2 - tickLength/2, y);
        ctx.lineTo(canvas.width - margin/2 + tickLength/2, y);
        ctx.stroke();
        ctx.fillText(
          `${(wall.height * (1 - i/5)).toFixed(2)}m`,
          canvas.width - margin/2 + tickLength,
          y
        );
      }
      
      // Width measurement with ticks
      ctx.beginPath();
      ctx.moveTo(margin, canvas.height - margin/2);
      ctx.lineTo(canvas.width - margin, canvas.height - margin/2);
      ctx.stroke();
      
      for (let i = 0; i <= 5; i++) {
        const x = margin + (canvas.width - 2 * margin) * (i / 5);
        ctx.beginPath();
        ctx.moveTo(x, canvas.height - margin/2 - tickLength/2);
        ctx.lineTo(x, canvas.height - margin/2 + tickLength/2);
        ctx.stroke();
        ctx.fillText(
          `${(wall.width * (i/5)).toFixed(2)}m`,
          x - 20,
          canvas.height - margin/2 + tickLength + 10
        );
      }
    };

    // Start processing the first chunk
    processChunk(0);
  }, [wall]);

  return (
    <div className="relative">
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={800} 
        className="w-full aspect-square bg-black rounded-lg"
      />
    </div>
  );
};

export default WallViewer;