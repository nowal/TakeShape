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
  sessionId: string;
  images?: string[];
  model_path?: string | null;
  created_at?: number | Date | string;
  updated_at?: number | Date | string;
  processed?: boolean;
  [key: string]: any; // Allow for additional properties
}

// Define QuoteItem interface
export interface QuoteItem {
  description: string;
  amount: number;
  roomId?: string;
}

// Define AddOnConfirmation interface
export interface AddOnConfirmation {
  name: string;
  price: number;
  roomId: string;
  explanation: string;
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
  temporaryRooms: Record<string, Room>; // Rooms that exist in UI only before Firestore creation
  classifyingRooms: string[]; // Array of room IDs that are being classified
  classifiedRoomNames: Record<string, string>; // Store the classified names for rooms to prevent overwriting
  dropdownOpen?: boolean; // Whether the room dropdown is open
  currentAddOnConfirmation: AddOnConfirmation | null; // Current add-on being confirmed
  pendingAddOnConfirmations: AddOnConfirmation[]; // Queue of add-ons waiting for confirmation
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
