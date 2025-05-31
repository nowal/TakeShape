'use client';

import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';

// API base URLs - using Next.js API routes as proxies to Flask
const API_BASE_URL = ''; // Empty string for relative URLs through Next.js API routes
const DIRECT_FLASK_API_BASE_URL = 'https://api.takeshapehome.com'; // Direct Flask backend URL (fallback)
const LOCAL_API_BASE_URL = 'http://localhost:3000'; // Local development fallback

// Define the context shape
interface BatchProcessingContextType {
  sessionId: string | null;
  isInitialized: boolean;
  isProcessing: boolean;
  batchesSent: number;
  batchesProcessed: number;
  queueSize: number;
  reconstruction: any;
  hasReconstruction: boolean;
  initializeSession: () => Promise<string>;
  sendFrameBatch: (frames: string[]) => Promise<void>;
  checkProcessingStatus: () => Promise<void>;
  getReconstruction: () => Promise<any>;
  resetSession: () => void;
}

// Create the context
const BatchProcessingContext = createContext<BatchProcessingContextType | null>(null);

export const BatchProcessingProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // State
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [batchesSent, setBatchesSent] = useState(0);
  const [batchesProcessed, setBatchesProcessed] = useState(0);
  const [queueSize, setQueueSize] = useState(0);
  const [reconstruction, setReconstruction] = useState<any>(null);
  const [hasReconstruction, setHasReconstruction] = useState(false);
  
  // Refs
  const apiBaseUrlRef = useRef<string>(API_BASE_URL);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const initializationAttemptsRef = useRef<number>(0);
  const checkProcessingStatusRef = useRef<() => Promise<void>>(async () => {});
  
  // Get reconstruction
  const getReconstruction = useCallback(async (): Promise<any> => {
    if (!sessionId) {
      return null;
    }
    
    try {
      const response = await fetch(`${apiBaseUrlRef.current}/api/flask/reconstruction/${sessionId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // No reconstruction available yet
          return null;
        }
        throw new Error(`Failed to get reconstruction: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.status !== 'success' || !data.reconstruction) {
        return null;
      }
      
      // Update state
      setReconstruction(data.reconstruction);
      setHasReconstruction(true);
      
      return data.reconstruction;
      
    } catch (error) {
      console.error('Error getting reconstruction:', error);
      return null;
    }
  }, [sessionId]);
  
  // Check processing status
  const checkProcessingStatus = useCallback(async (): Promise<void> => {
    if (!sessionId) {
      return;
    }
    
    try {
      const response = await fetch(`${apiBaseUrlRef.current}/api/flask/check-processing/${sessionId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to check processing status: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Update state
      setIsProcessing(!data.processing_complete);
      setBatchesProcessed(data.batches_processed || 0);
      setBatchesSent(Math.max(batchesSent, data.batches_received || 0));
      setQueueSize(data.queue_size || 0);
      
      // If we have a reconstruction, get it
      if (data.has_reconstruction && !hasReconstruction) {
        setHasReconstruction(true);
        await getReconstruction();
      }
      
    } catch (error) {
      console.error('Error checking processing status:', error);
    }
  }, [sessionId, batchesSent, hasReconstruction, getReconstruction]);
  
  // Update the ref when the function changes
  useEffect(() => {
    checkProcessingStatusRef.current = checkProcessingStatus;
  }, [checkProcessingStatus]);
  
  // Start status polling
  const startStatusPolling = useCallback(() => {
    // Clear existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    // Start new interval
    pollingIntervalRef.current = setInterval(() => {
      checkProcessingStatusRef.current();
    }, 2000); // Poll every 2 seconds
    
  }, []);
  
  // Initialize session
  const initializeSession = useCallback(async (): Promise<string> => {
    console.log('Initializing batch processing session');
    
    // If we already have a session ID, just return it
    if (sessionId) {
      console.log(`Reusing existing session ID: ${sessionId}`);
      return sessionId;
    }
    
    // Reset initialization attempts
    initializationAttemptsRef.current = 0;
    
    // Try to initialize session with retry logic
    const attemptInitialization = async (): Promise<string> => {
      try {
        const response = await fetch(`${apiBaseUrlRef.current}/api/flask/start-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to initialize session: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.session_id) {
          throw new Error('No session ID returned from server');
        }
        
        console.log(`Session initialized with ID: ${data.session_id}`);
        setSessionId(data.session_id);
        setIsInitialized(true);
        
        return data.session_id;
      } catch (error) {
        console.error('Error initializing session:', error);
        
        // Try fallback URLs if we've failed multiple times
        if (initializationAttemptsRef.current >= 2) {
          if (apiBaseUrlRef.current === API_BASE_URL) {
            console.log('Trying direct Flask API URL');
            apiBaseUrlRef.current = DIRECT_FLASK_API_BASE_URL;
          } else if (apiBaseUrlRef.current === DIRECT_FLASK_API_BASE_URL) {
            console.log('Trying local API URL');
            apiBaseUrlRef.current = LOCAL_API_BASE_URL;
          }
        }
        
        throw error;
      }
    };
    
    // Try to initialize with retries
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        const newSessionId = await attemptInitialization();
        
        // Start polling for status
        startStatusPolling();
        
        return newSessionId;
      } catch (error) {
        retryCount++;
        initializationAttemptsRef.current++;
        
        if (retryCount >= maxRetries) {
          console.error('Failed to initialize session after multiple attempts');
          throw error;
        }
        
        // Wait before retrying
        const delayMs = 1000 * Math.pow(1.5, retryCount);
        console.log(`Waiting ${Math.round(delayMs/1000)} seconds before retry ${retryCount}/${maxRetries}...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    
    throw new Error('Failed to initialize session after multiple attempts');
  }, [sessionId, startStatusPolling]);
  
  // Send frame batch
  const sendFrameBatch = useCallback(async (frames: string[]): Promise<void> => {
    if (!sessionId) {
      console.error('Cannot send frames: No session ID');
      throw new Error('No session ID');
    }
    
    if (frames.length === 0) {
      console.warn('No frames to send');
      return;
    }
    
    console.log(`Sending batch of ${frames.length} frames for session ${sessionId}`);
    
    try {
      // Create FormData
      const formData = new FormData();
      
      // Add frames as files
      frames.forEach((frameData, index) => {
        // Convert base64 to blob
        const byteString = atob(frameData.split(',')[1]);
        const mimeType = frameData.split(',')[0].split(':')[1].split(';')[0];
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const intArray = new Uint8Array(arrayBuffer);
        
        for (let i = 0; i < byteString.length; i++) {
          intArray[i] = byteString.charCodeAt(i);
        }
        
        const blob = new Blob([arrayBuffer], { type: mimeType });
        formData.append('frames', blob, `frame_${index}.jpg`);
      });
      
      // Send request
      const response = await fetch(`${apiBaseUrlRef.current}/api/flask/process-frames?sessionId=${sessionId}`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Failed to send frames: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.status !== 'success') {
        throw new Error(`Failed to send frames: ${data.message}`);
      }
      
      console.log(`Batch sent successfully: ${data.batch_id}`);
      
      // Update state
      setBatchesSent(prev => prev + 1);
      setIsProcessing(true);
      
      // Check status immediately
      await checkProcessingStatus();
      
    } catch (error) {
      console.error('Error sending frame batch:', error);
      throw error;
    }
  }, [sessionId, checkProcessingStatus]);
  
  // Reset session
  const resetSession = useCallback(() => {
    console.log('Resetting batch processing session');
    
    // Clear polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    // Reset state
    setSessionId(null);
    setIsInitialized(false);
    setIsProcessing(false);
    setBatchesSent(0);
    setBatchesProcessed(0);
    setQueueSize(0);
    setReconstruction(null);
    setHasReconstruction(false);
    
  }, []);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);
  
  // Context value
  const contextValue: BatchProcessingContextType = {
    sessionId,
    isInitialized,
    isProcessing,
    batchesSent,
    batchesProcessed,
    queueSize,
    reconstruction,
    hasReconstruction,
    initializeSession,
    sendFrameBatch,
    checkProcessingStatus,
    getReconstruction,
    resetSession
  };
  
  return (
    <BatchProcessingContext.Provider value={contextValue}>
      {children}
    </BatchProcessingContext.Provider>
  );
};

// Custom hook to use the batch processing context
export const useBatchProcessing = () => {
  const context = useContext(BatchProcessingContext);
  if (!context) {
    throw new Error('useBatchProcessing must be used within a BatchProcessingProvider');
  }
  return context;
};
