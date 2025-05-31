'use client';

import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
// Removed Socket.io import to prevent connection attempts
import type { Socket } from 'socket.io-client';

// Define event types
interface FrameProcessedResult {
  status?: string;
  message?: string;
  mode?: string;
  stats?: {
    frame_count: number;
    keyframe_count: number;
    section_count: number;
    current_section_id: number;
    queue_size: number;
  };
  reconstruction?: any;
  was_relocalized?: boolean;
}

interface ReconstructionResult {
  status: string;
  message?: string;
  reconstruction?: any;
  sections?: any[];
}

// Dummy API base URL - not actually used but kept for type compatibility
const DUMMY_API_URL = 'https://api.takeshapehome.com';

// Define the context shape
interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  isProcessing: boolean;
  isRelocalizing: boolean;
  frameCount: number;
  keyframeCount: number;
  sectionCount: number;
  currentMode: string;
  sessionId: string | null;
  connect: (sessionId?: string | null) => Promise<string | undefined>;
  disconnect: () => void;
  processVideoFrame: (frameData: string) => void;
  clearFrameQueue: () => void;
  getReconstruction: () => void;
  onReconstructionUpdate?: (reconstruction: any) => void;
  onRelocalizationNeeded?: () => void;
  onRelocalizationSucceeded?: () => void;
  setReconstructionUpdateHandler: (handler: (reconstruction: any) => void) => void;
  setRelocalizationNeededHandler: (handler: () => void) => void;
  setRelocalizationSucceededHandler: (handler: () => void) => void;
}

// Create the context
const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // State - using dummy values that won't change
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRelocalizing, setIsRelocalizing] = useState(false);
  const [frameCount, setFrameCount] = useState(0);
  const [keyframeCount, setKeyframeCount] = useState(0);
  const [sectionCount, setSectionCount] = useState(1);
  const [currentMode, setCurrentMode] = useState('INIT');
  
  // Refs - using dummy values
  const socketRef = useRef<Socket | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  
  // Callback refs for event handlers
  const onReconstructionUpdateRef = useRef<((reconstruction: any) => void) | undefined>(undefined);
  const onRelocalizationNeededRef = useRef<(() => void) | undefined>(undefined);
  const onRelocalizationSucceededRef = useRef<(() => void) | undefined>(undefined);
  
  // Set callback handlers - these still work but don't do anything
  const setReconstructionUpdateHandler = useCallback((handler: (reconstruction: any) => void) => {
    console.log('Socket context is disabled - using batch processing instead');
    onReconstructionUpdateRef.current = handler;
  }, []);
  
  const setRelocalizationNeededHandler = useCallback((handler: () => void) => {
    console.log('Socket context is disabled - using batch processing instead');
    onRelocalizationNeededRef.current = handler;
  }, []);
  
  const setRelocalizationSucceededHandler = useCallback((handler: () => void) => {
    console.log('Socket context is disabled - using batch processing instead');
    onRelocalizationSucceededRef.current = handler;
  }, []);
  
  // Connect to socket - now just returns a dummy session ID
  const connect = useCallback(async (sessionId?: string | null): Promise<string | undefined> => {
    console.log('Socket connections are disabled - using batch processing instead');
    // Generate a dummy session ID if none provided
    const dummySessionId = sessionId || `dummy-${Date.now()}`;
    sessionIdRef.current = dummySessionId;
    return dummySessionId;
  }, []);
  
  // Disconnect socket - now just a no-op
  const disconnect = useCallback(() => {
    console.log('Socket connections are disabled - using batch processing instead');
    // No actual disconnection needed
  }, []);
  
  // Process video frame - now just a no-op
  const processVideoFrame = useCallback((frameData: string) => {
    console.log('Socket connections are disabled - using batch processing instead');
    // No actual frame processing
  }, []);
  
  // Clear frame queue - now just a no-op
  const clearFrameQueue = useCallback(() => {
    console.log('Socket connections are disabled - using batch processing instead');
    // No actual queue to clear
  }, []);
  
  // Get reconstruction - now just a no-op
  const getReconstruction = useCallback(() => {
    console.log('Socket connections are disabled - using batch processing instead');
    // No actual reconstruction to get
  }, []);
  
  // Context value - same interface but with dummy implementations
  const contextValue: SocketContextType = {
    socket: null, // No actual socket
    isConnected: false, // Always disconnected
    isProcessing: false,
    isRelocalizing: false,
    frameCount: 0,
    keyframeCount: 0,
    sectionCount: 1,
    currentMode: 'DISABLED', // Special mode to indicate this is disabled
    sessionId: sessionIdRef.current,
    connect,
    disconnect,
    processVideoFrame,
    clearFrameQueue,
    getReconstruction,
    onReconstructionUpdate: onReconstructionUpdateRef.current,
    onRelocalizationNeeded: onRelocalizationNeededRef.current,
    onRelocalizationSucceeded: onRelocalizationSucceededRef.current,
    setReconstructionUpdateHandler,
    setRelocalizationNeededHandler,
    setRelocalizationSucceededHandler
  };
  
  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use the socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
