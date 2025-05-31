import { useState, useRef, useCallback, useEffect } from 'react';
import { useSocket } from '../context/socketContext';

interface UseRealtimeVideoProcessingProps {
  sessionId: string | null;
  onReconstructionUpdate?: (reconstruction: any) => void;
  onRelocalizationNeeded?: () => void;
  onRelocalizationSucceeded?: () => void;
}

interface UseRealtimeVideoProcessingReturn {
  isConnected: boolean;
  isProcessing: boolean;
  isRelocalizing: boolean;
  frameCount: number;
  keyframeCount: number;
  sectionCount: number;
  currentMode: string;
  initRealtimeProcessing: () => Promise<void>;
  stopRealtimeProcessing: () => void;
  processVideoFrame: (frameData: string) => void;
  clearFrameQueue: () => void;
}

/**
 * Hook for real-time video processing using WebSockets
 * This version uses the socket context for connection management
 */
export const useRealtimeVideoProcessing = ({
  sessionId,
  onReconstructionUpdate,
  onRelocalizationNeeded,
  onRelocalizationSucceeded
}: UseRealtimeVideoProcessingProps): UseRealtimeVideoProcessingReturn => {
  // Use the socket context
  const socket = useSocket();
  
  // Component ID for logging
  const componentIdRef = useRef<string>(`socket-hook-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
  
  // Set up event handlers
  useEffect(() => {
    console.log(`[${componentIdRef.current}] Setting up event handlers`);
    
    if (onReconstructionUpdate) {
      socket.setReconstructionUpdateHandler(onReconstructionUpdate);
    }
    
    if (onRelocalizationNeeded) {
      socket.setRelocalizationNeededHandler(onRelocalizationNeeded);
    }
    
    if (onRelocalizationSucceeded) {
      socket.setRelocalizationSucceededHandler(onRelocalizationSucceeded);
    }
    
    // No cleanup needed as the context maintains these handlers
  }, [socket, onReconstructionUpdate, onRelocalizationNeeded, onRelocalizationSucceeded]);
  
  // Initialize real-time processing
  const initRealtimeProcessing = useCallback(async () => {
    console.log(`[${componentIdRef.current}] Initializing real-time processing with session ID: ${sessionId}`);
    await socket.connect(sessionId);
  }, [socket, sessionId]);
  
  // Stop real-time processing
  const stopRealtimeProcessing = useCallback(() => {
    console.log(`[${componentIdRef.current}] Stopping real-time processing (but keeping socket connection)`);
    // We don't actually disconnect the socket here anymore
    // The socket connection is managed by the context
  }, []);
  
  // Process a video frame
  const processVideoFrame = useCallback((frameData: string) => {
    socket.processVideoFrame(frameData);
  }, [socket]);
  
  // Clear frame queue
  const clearFrameQueue = useCallback(() => {
    socket.clearFrameQueue();
  }, [socket]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      console.log(`[${componentIdRef.current}] Component unmounting, but socket connection is maintained by context`);
      // We don't disconnect the socket here anymore
      // The socket connection is managed by the context
    };
  }, []);
  
  return {
    isConnected: socket.isConnected,
    isProcessing: socket.isProcessing,
    isRelocalizing: socket.isRelocalizing,
    frameCount: socket.frameCount,
    keyframeCount: socket.keyframeCount,
    sectionCount: socket.sectionCount,
    currentMode: socket.currentMode,
    initRealtimeProcessing,
    stopRealtimeProcessing,
    processVideoFrame,
    clearFrameQueue
  };
};
