'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface PointCloudViewerProps {
  pointsData: { [key: string]: { points: number[][], colors: number[][] } };
  posesData: { position: number[], orientation: number[] }[];
  onFrameRendered: (frameId: number) => void;
}

const PointCloudViewer: React.FC<PointCloudViewerProps> = ({
  pointsData,
  posesData,
  onFrameRendered,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const pointsGeometryRef = useRef<THREE.BufferGeometry | null>(null);
  const pointsMaterialRef = useRef<THREE.PointsMaterial | null>(null);
  const pointsObjectRef = useRef<THREE.Points | null>(null);
  const keyframeData = useRef(new Map<string, { positions: Float32Array, colors: Float32Array }>());

  const updatePointCloud = useCallback(() => {
    if (!pointsGeometryRef.current) return;

    const allPositions: Float32Array[] = [];
    const allColors: Float32Array[] = [];
    for (const [_, data] of keyframeData.current) {
      allPositions.push(data.positions);
      allColors.push(data.colors);
    }

    const mergedPositions = new Float32Array(allPositions.map(a => a.length).reduce((a, b) => a + b, 0));
    let offset = 0;
    for (const arr of allPositions) {
      mergedPositions.set(arr, offset);
      offset += arr.length;
    }

    const mergedColors = new Float32Array(allColors.map(a => a.length).reduce((a, b) => a + b, 0));
    offset = 0;
    for (const arr of allColors) {
      mergedColors.set(arr, offset);
      offset += arr.length;
    }

    pointsGeometryRef.current.setAttribute('position', new THREE.BufferAttribute(mergedPositions, 3));
    pointsGeometryRef.current.setAttribute('color', new THREE.BufferAttribute(mergedColors, 3));
    pointsGeometryRef.current.attributes.position.needsUpdate = true;
    pointsGeometryRef.current.attributes.color.needsUpdate = true;
    pointsGeometryRef.current.computeBoundingSphere();
  }, []);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Initialize scene, camera, and renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x101010);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.set(0, 2, 5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    rendererRef.current = renderer;
    currentMount.appendChild(renderer.domElement);

    // Initialize controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    // Initialize point cloud object
    const geometry = new THREE.BufferGeometry();
    pointsGeometryRef.current = geometry;
    const material = new THREE.PointsMaterial({ size: 0.05, vertexColors: true });
    pointsMaterialRef.current = material;
    const points = new THREE.Points(geometry, material);
    scene.add(points);
    pointsObjectRef.current = points;

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      currentMount.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    if (!pointsData) return;

    Object.keys(pointsData).forEach(keyframeId => {
      const data = pointsData[keyframeId];
      const positions = new Float32Array(data.points.flat());
      const colors = new Float32Array(data.colors.flat().map(c => c / 255.0));
      keyframeData.current.set(keyframeId, { positions, colors });
    });

    updatePointCloud();

    if (posesData.length > 0) {
      onFrameRendered(posesData.length - 1);
    }
  }, [pointsData, posesData, onFrameRendered, updatePointCloud]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};

export default PointCloudViewer;
