import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface PointCloudViewerProps {
  pointcloud: any;
  confidence: any;
}

const PointCloudViewer: React.FC<PointCloudViewerProps> = ({ pointcloud, confidence }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    if (!containerRef.current || !pointcloud || !confidence) return;
    console.log('Setting up Three.js scene');

    try {
      // Log the structure
      console.log('Pointcloud data structure:', {
        dimensions: [pointcloud.length, pointcloud[0].length, pointcloud[0][0].length],
        sample: pointcloud[0][0][0]
      });

      // Setup scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;
      scene.background = new THREE.Color(0x000000);

      // Setup camera
      const camera = new THREE.PerspectiveCamera(
        75,
        containerRef.current.clientWidth / containerRef.current.clientHeight,
        0.1,
        1000
      );
      camera.position.z = 2;

      // Setup renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      containerRef.current.appendChild(renderer.domElement);

      // Add controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;

      // Create points geometry
      const geometry = new THREE.BufferGeometry();
      
      // Convert point cloud to flat array
      let vertices: number[] = [];
      let colors: number[] = [];

      // Process the 224x224x3 point cloud data
      for (let i = 0; i < pointcloud[0].length; i++) {
        for (let j = 0; j < pointcloud[0][i].length; j++) {
          const point = [
            pointcloud[0][i][j][0],
            pointcloud[0][i][j][1],
            pointcloud[0][i][j][2]
          ];
          
          // Only add valid points
          if (!point.some(val => isNaN(val) || !isFinite(val))) {
            vertices.push(...point);
            
            // Use confidence value for color
            const conf = confidence[0][i][j];
            colors.push(conf, 0, 1 - conf);
          }
        }
      }

      console.log(`Created ${vertices.length / 3} valid points`);

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

      // Create points material
      const material = new THREE.PointsMaterial({
        size: 0.01,
        vertexColors: true,
        transparent: true,
        opacity: 0.7
      });

      // Create points and add to scene
      const points = new THREE.Points(geometry, material);
      scene.add(points);
      pointsRef.current = points;

      // Center camera on points
      geometry.computeBoundingBox();
      const box = geometry.boundingBox;
      if (box) {
        const center = new THREE.Vector3();
        box.getCenter(center);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        
        camera.position.copy(center);
        camera.position.z += maxDim * 2;
        controls.target.copy(center);
      }

      // Animation loop
      let animationFrameId: number;
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();

      // Cleanup
      return () => {
        cancelAnimationFrame(animationFrameId);
        renderer.dispose();
        geometry.dispose();
        material.dispose();
        if (containerRef.current && renderer.domElement) {
          containerRef.current.removeChild(renderer.domElement);
        }
      };

    } catch (error) {
      console.error('Error setting up point cloud:', error);
    }
  }, [pointcloud, confidence]);

  return (
    <div ref={containerRef} className="w-full h-full bg-black rounded relative">
      <div className="absolute top-2 left-2 text-xs text-white bg-black bg-opacity-50 p-1 rounded">
        Points: {pointcloud ? pointcloud[0].length * pointcloud[0][0].length : 0}
      </div>
    </div>
  );
};

export default PointCloudViewer;