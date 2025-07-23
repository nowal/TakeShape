'use client';

import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { createPointCloudFromFlatArray } from '../utils/pointCloudParser';

interface ResultsScreenProps {
  pointCloudData: number[];
  onBack?: () => void;
}

function PointCloudViewer({ data }: { data: number[] }) {
  const groupRef = useRef<THREE.Group>(null!);
  const [pointCloud, setPointCloud] = useState<THREE.Points | null>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !groupRef.current) return;

    // Clear existing point cloud
    if (pointCloud) {
      groupRef.current.remove(pointCloud);
      // Dispose of geometry and material to prevent memory leaks
      pointCloud.geometry.dispose();
      if (pointCloud.material instanceof THREE.Material) {
        pointCloud.material.dispose();
      }
    }

    // Create new point cloud from flat array
    const newPointCloud = createPointCloudFromFlatArray(data, 0.02);
    
    if (newPointCloud) {
      groupRef.current.add(newPointCloud);
      setPointCloud(newPointCloud);
      
      // Center the camera on the point cloud
      const box = new THREE.Box3().setFromObject(newPointCloud);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      // Log some info about the point cloud
      console.log('Point cloud loaded:', {
        numPoints: data.length / 6,
        center: center.toArray(),
        size: size.toArray()
      });
    }

    // Cleanup function
    return () => {
      if (newPointCloud) {
        newPointCloud.geometry.dispose();
        if (newPointCloud.material instanceof THREE.Material) {
          newPointCloud.material.dispose();
        }
      }
    };
  }, [data, pointCloud]);

  return <group ref={groupRef} />;
}

export default function ResultsScreen({ 
  pointCloudData, 
  onBack 
}: ResultsScreenProps) {
  const hasData = pointCloudData && pointCloudData.length > 0;
  const numPoints = hasData ? Math.floor(pointCloudData.length / 6) : 0;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10,
      }}
    >
      {/* Header with back button and info */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          right: '20px',
          zIndex: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {onBack && (
          <button
            onClick={onBack}
            style={{
              padding: '8px 16px',
              backgroundColor: 'rgba(0, 122, 255, 0.9)',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
            }}
          >
            ← Back
          </button>
        )}
        
        <div
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            backdropFilter: 'blur(10px)',
          }}
        >
          {numPoints.toLocaleString()} points
        </div>
      </div>

      {/* Three.js Canvas */}
      {hasData ? (
        <Canvas 
          camera={{ 
            position: [2, 2, 2], 
            fov: 75,
            near: 0.01,
            far: 1000
          }}
          style={{ 
            width: '100%', 
            height: '100%',
            background: 'transparent' 
          }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          <pointLight position={[-10, -10, -10]} intensity={0.4} />
          
          {/* Coordinate axes helper (small) */}
          <axesHelper args={[0.5]} />
          
          {/* Point Cloud */}
          <Suspense fallback={null}>
            <PointCloudViewer data={pointCloudData} />
          </Suspense>
          
          {/* Controls */}
          <OrbitControls 
            enableZoom={true} 
            enablePan={true}
            enableRotate={true}
            zoomSpeed={0.6}
            panSpeed={0.8}
            rotateSpeed={0.4}
            makeDefault 
          />
        </Canvas>
      ) : (
        /* No Data Message */
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255, 255, 255, 0.7)',
            textAlign: 'center',
            padding: '40px',
          }}
        >
          <div
            style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '12px',
            }}
          >
            No Point Cloud Data
          </div>
          <div
            style={{
              fontSize: '14px',
              lineHeight: '1.4',
              maxWidth: '280px',
            }}
          >
            The 3D reconstruction could not be completed. Please try recording again.
          </div>
        </div>
      )}

      {/* Instructions overlay */}
      {hasData && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            right: '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'rgba(255, 255, 255, 0.8)',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '12px',
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
            zIndex: 20,
          }}
        >
          Drag to rotate • Pinch to zoom • Two fingers to pan
        </div>
      )}
    </div>
  );
}
