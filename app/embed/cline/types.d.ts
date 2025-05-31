// Type definitions for Three.js in the global window object
interface Window {
  THREE: any;
}

// Type definitions for OrbitControls
declare namespace THREE {
  class OrbitControls {
    constructor(camera: THREE.Camera, domElement: HTMLElement);
    update(): void;
    enableDamping: boolean;
    dampingFactor: number;
    enableZoom: boolean;
    enablePan: boolean;
    autoRotate: boolean;
    autoRotateSpeed: number;
    minDistance: number;
    maxDistance: number;
  }
}
