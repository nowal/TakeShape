import { useRef, useEffect } from 'react';

interface PointCloudData {
  points: number[][];
  colors: number[][];
}

interface UsePointCloudRendererProps {
  containerRef: React.RefObject<HTMLDivElement>;
  pointCloudData: PointCloudData | null;
  isVisible: boolean;
}

/**
 * Custom hook for rendering a 3D point cloud using Three.js
 */
export const usePointCloudRenderer = ({
  containerRef,
  pointCloudData,
  isVisible
}: UsePointCloudRendererProps) => {
  // Refs for cleanup
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const resizeListenerRef = useRef<(() => void) | null>(null);

  // Load Three.js dynamically
  const loadThreeJs = async (): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      // Check if Three.js is already loaded
      if (window.THREE) {
        resolve();
        return;
      }
      
      // Create script elements for Three.js and OrbitControls
      const threeScript = document.createElement('script');
      threeScript.src = 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.min.js';
      threeScript.async = true;
      
      const orbitControlsScript = document.createElement('script');
      orbitControlsScript.src = 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/controls/OrbitControls.js';
      orbitControlsScript.async = true;
      
      // Add event listeners
      threeScript.onload = () => {
        // Load OrbitControls after Three.js is loaded
        document.head.appendChild(orbitControlsScript);
      };
      
      orbitControlsScript.onload = () => {
        resolve();
      };
      
      threeScript.onerror = () => reject(new Error('Failed to load Three.js'));
      orbitControlsScript.onerror = () => reject(new Error('Failed to load OrbitControls'));
      
      // Add Three.js script to the document
      document.head.appendChild(threeScript);
    });
  };

  // Render point cloud
  const renderPointCloud = async () => {
    if (!containerRef.current || !pointCloudData) return;

    try {
      // Clear the container
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
      
      // Show loading message
      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'loading';
      loadingDiv.innerHTML = `
        <p>Loading point cloud viewer...</p>
        <div class="spinner"></div>
      `;
      containerRef.current.appendChild(loadingDiv);
      
      // Load Three.js
      await loadThreeJs();
      
      // Check if container is still available
      if (!containerRef.current) return;
      
      // Clear the container again
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
      
      // Create Three.js scene
      const THREE = window.THREE;
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);
      sceneRef.current = scene;
      
      // Create camera
      const camera = new THREE.PerspectiveCamera(
        75, 
        containerRef.current.clientWidth / containerRef.current.clientHeight, 
        0.1, 
        1000
      );
      camera.position.z = 5;
      
      // Create renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      containerRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;
      
      // Add ambient light
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
      scene.add(ambientLight);
      
      // Add directional light
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);
      
      // Add orbit controls
      const controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.25;
      
      // Create point cloud geometry
      const geometry = new THREE.BufferGeometry();
      
      // Convert points array to Float32Array for Three.js
      const vertices = new Float32Array(pointCloudData.points.length * 3);
      const colors = new Float32Array(pointCloudData.colors.length * 3);
      
      for (let i = 0; i < pointCloudData.points.length; i++) {
        vertices[i * 3] = pointCloudData.points[i][0];
        vertices[i * 3 + 1] = pointCloudData.points[i][1];
        vertices[i * 3 + 2] = pointCloudData.points[i][2];
        
        colors[i * 3] = pointCloudData.colors[i][0];
        colors[i * 3 + 1] = pointCloudData.colors[i][1];
        colors[i * 3 + 2] = pointCloudData.colors[i][2];
      }
      
      // Add attributes to geometry
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      
      // Create point cloud material
      const material = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        sizeAttenuation: true
      });
      
      // Create point cloud
      const pointCloud = new THREE.Points(geometry, material);
      scene.add(pointCloud);
      
      // Center the point cloud
      geometry.computeBoundingSphere();
      const center = geometry.boundingSphere.center;
      pointCloud.position.set(-center.x, -center.y, -center.z);
      
      // Set camera position based on bounding sphere
      const radius = geometry.boundingSphere.radius;
      camera.position.set(radius, radius, radius * 1.5);
      camera.lookAt(0, 0, 0);
      
      // Improve controls settings
      controls.enableZoom = true;
      controls.enablePan = true;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
      controls.minDistance = radius * 0.5;
      controls.maxDistance = radius * 5;
      controls.update();
      
      // Handle window resize
      const handleResize = () => {
        if (!containerRef.current || !renderer) return;
        
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };
      
      window.addEventListener('resize', handleResize);
      resizeListenerRef.current = handleResize;
      
      // Animation loop
      const animate = () => {
        animationFrameRef.current = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      
      animate();
      
    } catch (error) {
      console.error('Error rendering point cloud:', error);
      
      // Show error message
      if (containerRef.current) {
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
          <p>Error rendering point cloud</p>
          <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
        `;
        
        containerRef.current.appendChild(errorDiv);
      }
    }
  };

  // Cleanup function
  const cleanup = () => {
    // Cancel animation frame
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Remove resize listener
    if (resizeListenerRef.current) {
      window.removeEventListener('resize', resizeListenerRef.current);
      resizeListenerRef.current = null;
    }
    
    // Dispose Three.js resources
    if (sceneRef.current) {
      // Recursively dispose all objects in the scene
      sceneRef.current.traverse((object: any) => {
        if (object.geometry) {
          object.geometry.dispose();
        }
        
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material: any) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      
      sceneRef.current = null;
    }
    
    // Dispose renderer
    if (rendererRef.current) {
      rendererRef.current.dispose();
      rendererRef.current = null;
    }
  };

  // Effect to render point cloud when data is available and visible
  useEffect(() => {
    if (isVisible && pointCloudData) {
      renderPointCloud();
    }
    
    // Cleanup on unmount or when dependencies change
    return cleanup;
  }, [pointCloudData, isVisible]);

  return {
    renderPointCloud,
    cleanup
  };
};
