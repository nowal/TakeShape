import React, { useEffect, useRef } from 'react';

interface WallSegment {
  points: number[][];
  local_points: number[][];
  transform: number[][];
  height: number;
  width: number;
}

interface FloorPlanViewerProps {
  walls: WallSegment[];
}

const FloorPlanViewer: React.FC<FloorPlanViewerProps> = ({ walls }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!walls || !walls.length || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Get wall positions from transform matrices
    const wallPositions = walls.map(wall => {
      const transform = wall.transform;
      // The last column of the transform matrix contains the position
      return {
        x: transform[0][3] || transform[3][0],
        y: transform[2][3] || transform[3][2], // Using z coordinate as y in 2D view
        angle: Math.atan2(transform[0][1], transform[0][0]),
        width: wall.width
      };
    });

    // Find bounds to scale the drawing
    const minX = Math.min(...wallPositions.map(p => p.x - p.width/2));
    const maxX = Math.max(...wallPositions.map(p => p.x + p.width/2));
    const minY = Math.min(...wallPositions.map(p => p.y - p.width/2));
    const maxY = Math.max(...wallPositions.map(p => p.y + p.width/2));
    
    const margin = 50;
    const sceneWidth = maxX - minX;
    const sceneHeight = maxY - minY;
    const scale = Math.min(
      (canvas.width - 2 * margin) / sceneWidth,
      (canvas.height - 2 * margin) / sceneHeight
    );

    // Transform from world to canvas coordinates
    const transformPoint = (x: number, y: number) => {
      const canvasX = ((x - minX) * scale) + margin;
      const canvasY = ((y - minY) * scale) + margin;
      return [canvasX, canvasY];
    };
    
    // Draw walls
    wallPositions.forEach((wall, index) => {
      ctx.strokeStyle = 'white';
      ctx.fillStyle = 'white';
      ctx.lineWidth = 2;
      ctx.font = '12px Arial';

      // Calculate wall endpoints
      const startX = wall.x - (wall.width/2) * Math.cos(wall.angle);
      const startY = wall.y - (wall.width/2) * Math.sin(wall.angle);
      const endX = wall.x + (wall.width/2) * Math.cos(wall.angle);
      const endY = wall.y + (wall.width/2) * Math.sin(wall.angle);

      // Transform to canvas coordinates
      const [x1, y1] = transformPoint(startX, startY);
      const [x2, y2] = transformPoint(endX, endY);

      // Draw wall
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Draw wall label
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      ctx.save();
      ctx.translate(midX, midY);
      ctx.rotate(wall.angle);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`${wall.width.toFixed(1)}m`, 0, -5);
      ctx.restore();

      // Draw wall number
      ctx.fillText(`${index + 1}`, x1 - 10, y1 - 5);
    });

  }, [walls]);

  return (
    <div className="relative">
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={800} 
        className="w-full aspect-square bg-black rounded-lg"
      />
      <div className="mt-2 text-center text-sm text-gray-500">
        Showing {walls.length} walls in floor plan view
      </div>
    </div>
  );
};

export default FloorPlanViewer;