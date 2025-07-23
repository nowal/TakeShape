import * as THREE from 'three';

/**
 * Parses a flat array containing point cloud data in the format:
 * [x1,y1,z1,x2,y2,z2,...,r1,g1,b1,r2,g2,b2,...]
 * 
 * @param data - Flat array with xyz coordinates followed by rgb colors
 * @returns Object containing positions and colors as Float32Arrays
 */
export function parsePointCloudData(data: number[]): {
  positions: Float32Array;
  colors: Float32Array;
  numPoints: number;
} {
  if (!data || data.length === 0) {
    return {
      positions: new Float32Array(0),
      colors: new Float32Array(0),
      numPoints: 0
    };
  }

  // Each point has 6 values: x,y,z,r,g,b
  const numPoints = data.length / 6;
  
  if (numPoints !== Math.floor(numPoints)) {
    console.warn('Point cloud data length is not divisible by 6. Some data may be truncated.');
  }
  
  const actualNumPoints = Math.floor(numPoints);
  const positions = new Float32Array(actualNumPoints * 3);
  const colors = new Float32Array(actualNumPoints * 3);

  // First half of array contains xyz coordinates
  // Second half contains rgb colors
  const colorOffset = actualNumPoints * 3;

  for (let i = 0; i < actualNumPoints; i++) {
    // Extract positions (x, y, z)
    positions[i * 3] = data[i * 3];         // x
    positions[i * 3 + 1] = data[i * 3 + 1]; // y
    positions[i * 3 + 2] = data[i * 3 + 2]; // z
    
    // Extract colors (r, g, b) and normalize to 0-1 range
    colors[i * 3] = data[colorOffset + i * 3] / 255;         // r
    colors[i * 3 + 1] = data[colorOffset + i * 3 + 1] / 255; // g
    colors[i * 3 + 2] = data[colorOffset + i * 3 + 2] / 255; // b
  }

  return {
    positions,
    colors,
    numPoints: actualNumPoints
  };
}

/**
 * Creates a Three.js Points object from parsed point cloud data
 * 
 * @param positions - Float32Array of xyz coordinates
 * @param colors - Float32Array of rgb colors (normalized 0-1)
 * @param pointSize - Size of each point in the visualization
 * @returns Three.js Points object ready to be added to scene
 */
export function createPointCloudMesh(
  positions: Float32Array,
  colors: Float32Array,
  pointSize: number = 0.01
): THREE.Points {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: pointSize,
    vertexColors: true,
    sizeAttenuation: true, // Points get smaller with distance
  });

  return new THREE.Points(geometry, material);
}

/**
 * Convenience function that combines parsing and mesh creation
 * 
 * @param data - Raw flat array from backend
 * @param pointSize - Size of points in visualization
 * @returns Three.js Points object or null if data is invalid
 */
export function createPointCloudFromFlatArray(
  data: number[],
  pointSize: number = 0.01
): THREE.Points | null {
  const parsed = parsePointCloudData(data);
  
  if (parsed.numPoints === 0) {
    console.warn('No valid point cloud data to display');
    return null;
  }

  console.log(`Creating point cloud with ${parsed.numPoints} points`);
  return createPointCloudMesh(parsed.positions, parsed.colors, pointSize);
}
