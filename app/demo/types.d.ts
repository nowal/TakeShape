import * as THREE from 'three';

declare global {
  interface Window {
    THREE: typeof THREE & {
      OrbitControls: any;
      GLTFLoader: any;
    };
  }
}

// Define Room interface
export interface Room {
  id: string;
  name: string;
  images: string[];
  model_path?: string | null;
  created_at: number;
  processed?: boolean;
}

// Define QuoteItem interface
export interface QuoteItem {
  description: string;
  amount: number;
  roomId?: string;
}

// Define RoomState interface
export interface RoomState {
  currentView: 'intake' | 'camera' | 'roomList' | 'quote';
  currentRoomId: string | null;
  imageCount: number;
  rooms: Record<string, Room>;
  stream: MediaStream | null;
  modelViewer: ModelViewer | null;
  activeRoom: string | null;
  activeInputField: { roomId: string; element: HTMLInputElement } | null;
  processingRoom: string | null;
  pendingImages: Blob[]; // Array to store captured image blobs locally
  pollingInterval: NodeJS.Timeout | null; // Interval for polling room updates
  addOns: QuoteItem[]; // Array to store identified add-ons
  analyzingAddOnsForRooms: string[]; // Array of room IDs being analyzed for add-ons
  quoteItems: QuoteItem[]; // Array of all quote line items
  totalQuoteAmount: number; // Total quote amount
}

// Define ThreeRef interface for THREE.js objects
export interface ThreeRef {
  THREE: typeof THREE | null;
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  controls: any | null;
  animationId: number | null;
}

// Define GLTF related interfaces
export interface GLTF {
  scene: THREE.Scene;
  scenes: THREE.Scene[];
  cameras: THREE.Camera[];
  animations: THREE.AnimationClip[];
  asset: {
    copyright?: string;
    generator?: string;
    version?: string;
    minVersion?: string;
    extensions?: any;
    extras?: any;
  };
  parser: any;
  userData: any;
}

export interface LoadingProgress {
  total: number;
  loaded: number;
}

// Export nothing as this is a declaration file
export {};
