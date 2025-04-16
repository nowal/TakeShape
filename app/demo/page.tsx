'use client';

import { useState, useEffect, useRef, FC } from 'react';
import { Room, RoomState, ThreeRef, QuoteItem } from './types';
import { useSession } from '@/context/session/provider';
import Chat from '@/components/chat';
import HomeownerIntake from '@/components/demo/homeowner-intake';
import { getPainter, Painter } from '@/utils/firestore/painter';
import { getPricingSheetByProviderId, PricingSheet } from '@/utils/firestore/pricingSheet';
import './RoomScanner.css';

// Use the Next.js API proxy routes instead of directly accessing the Flask backend
const API_BASE_URL = '/api/flask';

// Number of images required before processing
const REQUIRED_IMAGES_COUNT = 4;

// Static painter ID for demonstration purposes
// In a real embed, this would be replaced with the actual provider's ID
const DEMO_PAINTER_ID = "9IsuIup4lcqZB2KHd4yh";

// Instructions Modal Component
interface InstructionsModalProps {
  onClose: () => void;
  businessName?: string;
}

const InstructionsModal: FC<InstructionsModalProps> = ({ onClose, businessName }) => (
  <div className="instructions-modal">
    <button className="close-button" onClick={onClose}>×</button>
    <div className="instructions-content">
      <h3>How to Get a Quote from {businessName || 'Your Provider'}</h3>
      <ol>
        <li>Hold your phone steady and capture images from different angles</li>
        <li>Take at least 4 images for best results</li>
        <li>Ensure good lighting for better quality</li>
        <li>Avoid moving objects in the frame</li>
      </ol>
    </div>
  </div>
);

export default function RoomScanner() {
  // Use the session context
  const { sessionId, homeownerId, houseId } = useSession();
  
  // Create a ref to store pending images
  const pendingImagesRef = useRef<Blob[]>([]);
  
  // Track if instructions have been shown
  const [instructionsShown, setInstructionsShown] = useState(false);
  
  // Store painter information
  const [painter, setPainter] = useState<Painter | null>(null);
  
  // Store pricing sheet information
  const [pricingSheet, setPricingSheet] = useState<PricingSheet | null>(null);
  
  // State management
  const [state, setState] = useState<RoomState>({
    currentView: homeownerId ? 'camera' : 'intake', // Start with intake if no homeowner
    currentRoomId: null,
    imageCount: 0,
    rooms: {},
    stream: null,
    modelViewer: null,
    activeRoom: null,
    activeInputField: null,
    processingRoom: null,
    pendingImages: [], // Array to store captured image blobs locally (kept for type compatibility)
    pollingInterval: null, // Interval for polling room updates
    addOns: [], // Array to store identified add-ons
    analyzingAddOnsForRooms: [], // Array of room IDs being analyzed for add-ons
    quoteItems: [], // Array of all quote line items
    totalQuoteAmount: 0 // Total quote amount
  });

  // Refs for DOM elements
  const cameraViewRef = useRef<HTMLDivElement>(null);
  const roomListViewRef = useRef<HTMLDivElement>(null);
  const cameraFeedRef = useRef<HTMLVideoElement>(null);
  const cameraOverlayRef = useRef<HTMLCanvasElement>(null);
  const cameraFlashRef = useRef<HTMLDivElement>(null);
  const captureButtonRef = useRef<HTMLButtonElement>(null);
  const captureButtonInnerRef = useRef<HTMLDivElement>(null);
  const viewToggleRef = useRef<HTMLButtonElement>(null);
  const cameraButtonRef = useRef<HTMLButtonElement>(null);
  const imageCounterRef = useRef<HTMLSpanElement>(null);
  const roomListRef = useRef<HTMLUListElement>(null);
  const modelViewerRef = useRef<HTMLDivElement>(null);
  const loadingIndicatorRef = useRef<HTMLDivElement>(null);

  // THREE.js objects
  const threeRef = useRef<ThreeRef>({
    THREE: null,
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    animationId: null
  });

  // Fetch painter data and pricing sheet
  useEffect(() => {
    const fetchPainterData = async () => {
      try {
        const painterData = await getPainter(DEMO_PAINTER_ID);
        if (painterData) {
          setPainter(painterData);
          console.log('Painter data loaded:', painterData);
        }
      } catch (error) {
        console.error('Error fetching painter data:', error);
      }
    };
    
    const fetchPricingSheet = async () => {
      try {
        const sheet = await getPricingSheetByProviderId(DEMO_PAINTER_ID);
        if (sheet) {
          setPricingSheet(sheet);
          console.log('Pricing sheet loaded:', sheet);
        }
      } catch (error) {
        console.error('Error fetching pricing sheet:', error);
      }
    };
    
    fetchPainterData();
    fetchPricingSheet();
  }, []);
  
  // Helper function to check if any room is being processed
  const isProcessingAnyRoom = () => {
    return (
      state.processingRoom !== null || // 3D model still processing
      Object.values(state.rooms).some(room => room.name === 'Classifying...') || // Room still classifying
      state.analyzingAddOnsForRooms.length > 0 // Add-on analysis in progress
    );
  };

  // Initialize the application
  useEffect(() => {
    if (state.currentView === 'camera') {
      initCamera();
      
      // Attach click handler to capture button
      if (captureButtonRef.current) {
        captureButtonRef.current.addEventListener('click', captureImage);
      }
    }
    
    // Cleanup function
    return () => {
      // Remove event listener
      if (captureButtonRef.current) {
        captureButtonRef.current.removeEventListener('click', captureImage);
      }
      
      // Stop camera stream
      if (state.stream) {
        state.stream.getTracks().forEach(track => track.stop());
      }

      // Cancel animation frame
      if (threeRef.current.animationId) {
        cancelAnimationFrame(threeRef.current.animationId);
      }

      // Dispose Three.js resources
      if (threeRef.current.renderer) {
        threeRef.current.renderer.dispose();
      }
    };
  }, [state.currentView, sessionId]);

  // Update the API calls to include the session ID
  useEffect(() => {
    if (sessionId) {
      // Load rooms with session ID when it's available
      loadRooms();
    }
  }, [sessionId]);
  
  // Update currentView when homeownerId changes
  useEffect(() => {
    if (homeownerId) {
      console.log('Homeowner found:', { homeownerId, houseId });
      
      // Fetch homeowner details if needed
      const fetchHomeownerDetails = async () => {
        try {
          console.log(`Fetching homeowner details for ID: ${homeownerId}`);
          
          const response = await fetch(`/api/homeowner/${homeownerId}`);
          
          console.log('Homeowner API response:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('Homeowner details:', data);
          } else {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
        } catch (error) {
          // Type guard for Error objects
          const err = error instanceof Error ? error : new Error(String(error));
          
          console.error('Error fetching homeowner details:', {
            message: err.message,
            name: err.name,
            stack: err.stack
          });
        }
      };
      
      // Uncomment this if you have an API endpoint to fetch homeowner details
      // fetchHomeownerDetails();
      
      setState(prevState => ({
        ...prevState,
        currentView: 'camera'
      }));
    } else {
      console.log('No homeowner found, showing intake form');
    }
  }, [homeownerId, houseId]);

  // Handle homeowner intake completion
  const handleIntakeComplete = () => {
    setState(prevState => ({
      ...prevState,
      currentView: 'camera'
    }));
  };

  // Initialize camera
  const initCamera = async () => {
    try {
      console.log('Initializing camera with environment facing mode');
      
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      console.log('Requesting camera access with constraints:', constraints);
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log('Camera access granted, setting up video stream');
      
      if (cameraFeedRef.current) {
        cameraFeedRef.current.srcObject = stream;
      }
      
      setState(prevState => {
        return {
          ...prevState,
          stream
        };
      });
      
      console.log('Camera initialized successfully');
    } catch (error) {
      // Type guard for Error objects
      const err = error instanceof Error ? error : new Error(String(error));
      
      console.error('Error accessing camera:', {
        message: err.message,
        name: err.name,
        stack: err.stack
      });
      
      // Show a more detailed error message
      alert(`Unable to access camera: ${err.message}. Please ensure camera permissions are granted.`);
      
      // Switch to room list view if camera fails
      setState(prevState => ({
        ...prevState,
        currentView: 'roomList'
      }));
    }
  };

  // Load rooms from server with session ID
  const loadRooms = async () => {
    if (!sessionId) return;
    
    try {
      console.log('Loading rooms for session:', sessionId);
      
      // Load rooms through the Next.js API proxy with session ID
      const response = await fetch(`${API_BASE_URL}/rooms?sessionId=${sessionId}`);
      
      console.log('Rooms API response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Rooms data received:', {
        roomCount: data.rooms ? Object.keys(data.rooms).length : 0
      });
      
      // Update state with server data
      setState(prevState => ({
        ...prevState,
        rooms: data.rooms || {}
      }));
    } catch (error) {
      // Type guard for Error objects
      const err = error instanceof Error ? error : new Error(String(error));
      
      console.error('Error loading rooms:', {
        message: err.message,
        name: err.name,
        stack: err.stack
      });
    }
  };

  // Toggle between camera and room list views
  const toggleView = () => {
    const newView = state.currentView === 'camera' ? 'roomList' : 'camera';
    setState(prevState => ({
      ...prevState,
      currentView: newView
    }));
  };

  // Capture image from camera
  const captureImage = async () => {
    console.log('Capture image function called');
    
    if (!cameraFeedRef.current || !cameraOverlayRef.current || !sessionId) {
      console.error('Missing required refs or sessionId:', {
        cameraFeedRef: !!cameraFeedRef.current,
        cameraOverlayRef: !!cameraOverlayRef.current,
        sessionId
      });
      return;
    }
    
    // Trigger camera flash animation
    if (cameraFlashRef.current) {
      // Add the flash animation class
      cameraFlashRef.current.classList.add('flash-animation');
      
      // Remove the class after animation completes
      setTimeout(() => {
        if (cameraFlashRef.current) {
          cameraFlashRef.current.classList.remove('flash-animation');
        }
      }, 300); // Match the animation duration in CSS
    }
    
    // Add button press animation
    if (captureButtonRef.current) {
      captureButtonRef.current.style.transform = 'scale(0.95)';
      setTimeout(() => {
        if (captureButtonRef.current) {
          captureButtonRef.current.style.transform = 'scale(1)';
        }
      }, 150);
    }
    
    // Create an offscreen canvas to avoid interrupting the video stream
    const offscreenCanvas = document.createElement('canvas');
    const video = cameraFeedRef.current;
    const context = offscreenCanvas.getContext('2d');
    
    if (!context) {
      console.error('Failed to get canvas context');
      return;
    }
    
    console.log('Setting canvas dimensions', {
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight
    });
    
    // Set canvas dimensions to match video
    offscreenCanvas.width = video.videoWidth;
    offscreenCanvas.height = video.videoHeight;
    
    // Draw the video frame to the offscreen canvas
    context.drawImage(video, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
    console.log('Drew video frame to offscreen canvas');
    
    // Convert canvas to blob
    console.log('Converting canvas to blob...');
    offscreenCanvas.toBlob(async (blob) => {
      if (!blob) {
        console.error('Failed to capture image - blob is null');
        return;
      }
      
      console.log('Blob created successfully', {
        size: blob.size,
        type: blob.type
      });
      
      // Store the blob locally instead of uploading immediately
      // Add the blob to the ref
      pendingImagesRef.current.push(blob);
      
      // Use the functional form of setState to ensure we're using the latest state
      setState(prevState => {
        const newImageCount = prevState.imageCount + 1;
        
        // Update image counter display
        if (imageCounterRef.current) {
          imageCounterRef.current.textContent = newImageCount.toString();
        }
        
        // Return the new state
        return {
          ...prevState,
          imageCount: newImageCount
        };
      });
      
      // Check if we have enough images to process
      // Use the updated count directly instead of checking inside setState
      const newCount = pendingImagesRef.current.length;
      if (newCount >= REQUIRED_IMAGES_COUNT) {
        // Automatically process images when we reach the required count
        // No confirmation dialog needed
        console.log('Required image count reached, processing automatically');
        // Use requestAnimationFrame instead of setTimeout to avoid race conditions
        requestAnimationFrame(() => uploadAndProcessImages());
      }
    }, 'image/jpeg', 0.95);
  };
  
  // Upload all pending images and process the room
  const uploadAndProcessImages = async () => {
    console.log('Uploading and processing images');
    
    // Use the ref to get the latest pending images
    const pendingImages = pendingImagesRef.current;
    
    if (pendingImages.length === 0) {
      console.error('No pending images to upload');
      return;
    }
    
    console.log(`Found ${pendingImages.length} pending images to upload`, {
      imageDetails: pendingImages.map((blob, i) => ({
        index: i,
        size: blob.size,
        type: blob.type
      }))
    });
    
    try {
      // Switch to room list view immediately to show processing state
      setState(prevState => ({
        ...prevState,
        currentView: 'roomList'
      }));
      
      // Show loading indicator
      if (loadingIndicatorRef.current) {
        loadingIndicatorRef.current.classList.remove('hidden');
      }
      
      // Generate a new room ID
      const newRoomId = `room_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const roomName = `Classifying...`; // Show "Classifying..." while waiting for room type
      
      console.log(`Created new room with ID: ${newRoomId}, name: ${roomName}`);
      
      // Create a temporary room entry with a temporary name
      // This will be visible while the 3D model is being processed and room is being classified
      setState(prevState => ({
        ...prevState,
        rooms: {
          ...prevState.rooms,
          [newRoomId]: {
            id: newRoomId,
            name: roomName,
            images: [],
            created_at: Date.now(),
            processed: false
          }
        },
        activeRoom: newRoomId,
        processingRoom: newRoomId
      }));
      
      // Start polling for room name updates
      // This will check for updates every 2 seconds while the 3D model is being processed
      const pollingInterval = setInterval(async () => {
        console.log('Polling for room updates...');
        await loadRooms();
      }, 2000);
      
      // Store the interval ID so we can clear it later
      setState(prevState => ({
        ...prevState,
        pollingInterval
      }));
      
      // Create form data for direct processing
      const formData = new FormData();
      formData.append('sessionId', sessionId);
      formData.append('roomId', newRoomId);
      formData.append('roomName', roomName);
      
      // Add all pending images to the form data
      pendingImages.forEach((blob, index) => {
        const filename = `image_${Date.now()}_${index}.jpg`;
        formData.append(`image${index}`, blob, filename);
        console.log(`Added image${index} to FormData:`, { 
          filename, 
          size: blob.size, 
          type: blob.type 
        });
      });
      
      console.log('Sending images for direct processing', {
        endpoint: `${API_BASE_URL}/direct-process`,
        imageCount: pendingImages.length,
        sessionId,
        roomId: newRoomId,
        formDataEntries: Array.from(formData.entries()).map(([key]) => key)
      });
      
      // Set a timeout to detect if the request is taking too long
      const timeoutId = setTimeout(() => {
        console.warn('Direct process request is taking longer than expected (30s)');
      }, 30000);
      
      // Send all images for direct processing
      const response = await fetch(`${API_BASE_URL}/direct-process`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header manually, let the browser set it with the boundary
        headers: {
          // Add a custom header to help with debugging
          'X-Client-Info': 'TakeShape-Demo-App'
        }
      }).catch(err => {
        console.error('Fetch operation failed:', {
          message: err.message,
          name: err.name,
          stack: err.stack
        });
        throw err;
      });
      
      // Clear the timeout
      clearTimeout(timeoutId);
      
      console.log('Received response from server:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        ok: response.ok
      });
      
      if (!response.ok) {
        // Try to get more details from the error response
        let errorDetails = '';
        try {
          const errorData = await response.json();
          errorDetails = JSON.stringify(errorData);
          console.error('Error response body:', errorData);
        } catch (e) {
          // If we can't parse JSON, try to get text
          try {
            errorDetails = await response.text();
            console.error('Error response text:', errorDetails);
          } catch (e2) {
            console.error('Could not read error response body');
          }
        }
        
        throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorDetails}`);
      }
      
      // Parse the response JSON
      let data;
      try {
        data = await response.json();
        console.log('Direct process response:', data);
      } catch (jsonError) {
        console.error('Failed to parse response JSON:', jsonError);
        throw new Error('Invalid response format from server');
      }
      
      if (!data.modelPath) {
        console.error('Response missing modelPath:', data);
        throw new Error('Server response missing modelPath');
      }
      
      // Reload rooms from Firestore to get the updated room name
      await loadRooms();
      
      // Load the model
      loadModel(newRoomId, data.modelPath);
      
      // Clear the polling interval
      if (state.pollingInterval) {
        console.log('Clearing polling interval');
        clearInterval(state.pollingInterval);
      }
      
      // Set processingRoom to null and clear polling interval
      setState(prevState => ({
        ...prevState,
        processingRoom: null,
        pollingInterval: null
      }));
      
      // Reset pending images and image count
      pendingImagesRef.current = [];
      setState(prevState => ({
        ...prevState,
        imageCount: 0,
        currentRoomId: null
      }));
      
      // Reset image counter display
      if (imageCounterRef.current) {
        imageCounterRef.current.textContent = '0';
      }
      
      // Check for add-ons with Claude
      if (pricingSheet && pricingSheet.rules && pricingSheet.rules.length > 0) {
        // Add room to analyzingAddOnsForRooms
        setState(prevState => ({
          ...prevState,
          analyzingAddOnsForRooms: [...prevState.analyzingAddOnsForRooms, newRoomId]
        }));
        
        try {
          console.log('Checking for add-ons with Claude');
          
          // For each rule, ask Claude if it applies to this room
          for (const rule of pricingSheet.rules) {
            // Construct a message for Claude
            const message = `Based on the images of this room, does the following condition apply? "${rule.condition}" Please respond with YES or NO followed by a brief explanation.`;
            
            // Send to Claude API
            const response = await fetch('/api/anthropic', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                message,
                sessionId,
                context: `The user has uploaded images of a room and we need to determine if certain conditions apply for pricing.`
              })
            });
            
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Claude response for condition:', rule.condition, data.response);
            
            // Check if Claude's response indicates the condition applies
            if (data.response.toLowerCase().includes('yes')) {
              console.log('Add-on condition applies:', rule.condition);
              
              // Add this as an add-on
              setState(prevState => ({
                ...prevState,
                addOns: [
                  ...prevState.addOns,
                  {
                    description: rule.condition,
                    amount: rule.amount,
                    roomId: newRoomId
                  }
                ]
              }));
            }
          }
        } catch (error) {
          console.error('Error checking add-ons with Claude:', error);
        } finally {
          // Remove room from analyzingAddOnsForRooms when done
          setState(prevState => ({
            ...prevState,
            analyzingAddOnsForRooms: prevState.analyzingAddOnsForRooms.filter(id => id !== newRoomId)
          }));
        }
      }
      
      // Hide loading indicator
      if (loadingIndicatorRef.current) {
        loadingIndicatorRef.current.classList.add('hidden');
      }
    } catch (error) {
      // Type guard for Error objects
      const err = error instanceof Error ? error : new Error(String(error));
      
      console.error('Error uploading and processing images:', {
        message: err.message,
        name: err.name,
        stack: err.stack
      });
      
      // Show a more detailed error message
      alert(`Failed to upload and process images: ${err.message}. Check the console for more details.`);
      
      // Hide loading indicator
      if (loadingIndicatorRef.current) {
        loadingIndicatorRef.current.classList.add('hidden');
      }
      
      // Clear the polling interval if it exists
      if (state.pollingInterval) {
        console.log('Clearing polling interval due to error');
        clearInterval(state.pollingInterval);
      }
      
      // Reset camera state to allow retrying
      setState(prevState => ({
        ...prevState,
        imageCount: pendingImagesRef.current.length,
        pollingInterval: null
      }));
    }
  };

  // Handle room selection
  const handleRoomSelect = (roomId: string) => {
    setState(prevState => ({
      ...prevState,
      activeRoom: roomId
    }));
    
    // Load the 3D model if available
    const room = state.rooms[roomId];
    if (room && room.model_path) {
      loadModel(roomId, room.model_path);
    }
  };
  
  // Handle room name change
  const handleRoomNameChange = (roomId: string, name: string) => {
    setState(prevState => ({
      ...prevState,
      rooms: {
        ...prevState.rooms,
        [roomId]: {
          ...prevState.rooms[roomId],
          name
        }
      }
    }));
  };
  
  // Save room name to server
  const saveRoomName = async (roomId: string, name: string) => {
    if (!sessionId) return;
    
    try {
      console.log(`Saving name for room ${roomId}:`, name);
      
      // Update room name in Firestore directly
      // This bypasses the Flask API which is causing 404 errors
      const response = await fetch(`/api/rooms/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          roomId,
          name
        })
      });
      
      console.log('Save room name response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Update active input field
      setState(prevState => ({
        ...prevState,
        activeInputField: null
      }));
      
      // Update local state with the new name
      setState(prevState => ({
        ...prevState,
        rooms: {
          ...prevState.rooms,
          [roomId]: {
            ...prevState.rooms[roomId],
            name
          }
        }
      }));
      
      console.log('Room name saved successfully');
    } catch (error) {
      // Type guard for Error objects
      const err = error instanceof Error ? error : new Error(String(error));
      
      console.error('Error saving room name:', {
        message: err.message,
        name: err.name,
        stack: err.stack
      });
      
      // Show a notification to the user
      alert(`Failed to save room name: ${err.message}`);
    }
  };
  
  // Load 3D model
  const loadModel = (roomId: string, modelPath: string) => {
    console.log(`Loading model for room ${roomId}: ${modelPath}`);
    
    if (!modelPath) {
      console.error('No model path provided');
      return;
    }
    
    // Clear any existing content in the model viewer
    if (modelViewerRef.current) {
      modelViewerRef.current.innerHTML = '';
    }
    
    try {
      // Check if model-viewer is defined
      if (typeof customElements === 'undefined' || !customElements.get('model-viewer')) {
        console.warn('model-viewer custom element is not defined yet. Waiting for it to load...');
        
        // Add a message to the model viewer
        if (modelViewerRef.current) {
          modelViewerRef.current.innerHTML = `
            <div class="loading">
              <p>Loading 3D viewer...</p>
              <div class="spinner"></div>
            </div>
          `;
        }
        
        // Try again in 1 second
        setTimeout(() => loadModel(roomId, modelPath), 1000);
        return;
      }
      
      // Create a model-viewer element
      const modelViewer = document.createElement('model-viewer');
      
      // Add debugging attributes
      modelViewer.setAttribute('src', modelPath);
      modelViewer.setAttribute('alt', `3D model of ${state.rooms[roomId]?.name || 'room'}`);
      modelViewer.setAttribute('auto-rotate', '');
      modelViewer.setAttribute('camera-controls', '');
      modelViewer.setAttribute('style', 'width: 100%; height: 100%;');
      modelViewer.setAttribute('shadow-intensity', '1');
      modelViewer.setAttribute('exposure', '0.5');
      
      // Add debugging info
      console.log('Model-viewer element created with attributes:', {
        src: modelViewer.getAttribute('src'),
        alt: modelViewer.getAttribute('alt'),
        autoRotate: modelViewer.hasAttribute('auto-rotate'),
        cameraControls: modelViewer.hasAttribute('camera-controls')
      });
      
      // Add the model-viewer to the DOM
      if (modelViewerRef.current) {
        modelViewerRef.current.appendChild(modelViewer);
        console.log('Model-viewer element added to DOM');
      }
      
      // Add event listeners for loading and error states
      modelViewer.addEventListener('load', () => {
        console.log('Model loaded successfully');
      });
      
      modelViewer.addEventListener('error', (error) => {
        console.error('Error loading model:', error);
        
        // Try to fetch the model directly to see if it's accessible
        fetch(modelPath)
          .then(response => {
            console.log('Model fetch response:', {
              status: response.status,
              ok: response.ok,
              statusText: response.statusText,
              headers: Object.fromEntries(response.headers.entries())
            });
            
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            return response.blob();
          })
          .then(blob => {
            console.log('Model blob received:', {
              size: blob.size,
              type: blob.type
            });
          })
          .catch(fetchError => {
            console.error('Error fetching model directly:', fetchError);
          });
        
        // Show error message in the model viewer
        if (modelViewerRef.current) {
          modelViewerRef.current.innerHTML = `
            <div class="error">
              <p>Error loading 3D model</p>
              <p>Please try again later</p>
              <p class="error-details">Error: ${error.type || 'Unknown'}</p>
            </div>
          `;
        }
      });
    } catch (error) {
      console.error('Error setting up model viewer:', error);
      
      // Show error message in the model viewer
      if (modelViewerRef.current) {
        modelViewerRef.current.innerHTML = `
          <div class="error">
            <p>Error setting up 3D viewer</p>
            <p>Please try again later</p>
          </div>
        `;
      }
    }
  };
  
  // Process room to create 3D model
  const processRoom = async (roomId: string) => {
    if (!sessionId) return;
    
    try {
      setState(prevState => ({
        ...prevState,
        processingRoom: roomId
      }));
      
      // Show loading indicator if not already shown
      if (loadingIndicatorRef.current && loadingIndicatorRef.current.classList.contains('hidden')) {
        loadingIndicatorRef.current.classList.remove('hidden');
      }
      
      console.log('Processing room:', roomId);
      
      // Process the room
      const response = await fetch(`${API_BASE_URL}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roomId,
          sessionId
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Process response:', data);
      
      // Update rooms to get the latest data including the 3D model
      await loadRooms();
      
      // Update state to show the processed room
      setState(prevState => ({
        ...prevState,
        activeRoom: roomId,
        currentRoomId: null,
        imageCount: 0,
        processingRoom: null,
        // pendingImages already cleared in the ref
      }));
      
      // Reset image counter display
      if (imageCounterRef.current) {
        imageCounterRef.current.textContent = '0';
      }
      
      // Hide loading indicator
      if (loadingIndicatorRef.current) {
        loadingIndicatorRef.current.classList.add('hidden');
      }
    } catch (error) {
      // Type guard for Error objects
      const err = error instanceof Error ? error : new Error(String(error));
      
      console.error('Error processing room:', {
        message: err.message,
        name: err.name,
        stack: err.stack
      });
      
      alert(`Failed to process room: ${err.message}. Please try again.`);
      
      setState(prevState => ({
        ...prevState,
        processingRoom: null
      }));
      
      // Hide loading indicator
      if (loadingIndicatorRef.current) {
        loadingIndicatorRef.current.classList.add('hidden');
      }
    }
  };

  // Generate quote
  const generateQuote = () => {
    if (!pricingSheet) {
      console.error('No pricing sheet available');
      return;
    }
    
    const roomCount = Object.keys(state.rooms).length;
    const basePrice = roomCount * (pricingSheet.perRoom || 0);
    
    // Start with the base price as the first line item
    const quoteItems: QuoteItem[] = [
      {
        description: `Base Price (${roomCount} rooms)`,
        amount: basePrice
      }
    ];
    
    // Add all the add-ons that have been identified
    quoteItems.push(...state.addOns);
    
    // Calculate total
    const totalAmount = quoteItems.reduce((sum, item) => sum + item.amount, 0);
    
    // Update state
    setState(prevState => ({
      ...prevState,
      currentView: 'quote',
      quoteItems,
      totalQuoteAmount: totalAmount
    }));
  };
  
  // Render the component
  return (
    <div className="app-container">
      {/* Chat Component */}
      {sessionId && <Chat sessionId={sessionId} />}
      
      {/* Homeowner Intake Form */}
      {state.currentView === 'intake' && (
        <HomeownerIntake onComplete={handleIntakeComplete} />
      )}
      
      {/* Camera View */}
      <div 
        ref={cameraViewRef} 
        className={`view camera-view ${state.currentView === 'camera' ? '' : 'hidden'}`}
      >
        {/* Instructions Modal - only show when camera view is active and instructions haven't been shown yet */}
        {state.currentView === 'camera' && !instructionsShown && (
          <InstructionsModal 
            onClose={() => setInstructionsShown(true)} 
            businessName={painter?.businessName}
          />
        )}
        <div className="camera-header">
          <div className="image-counter">Images: <span ref={imageCounterRef}>0</span></div>
          <button ref={viewToggleRef} className="chevron-button" onClick={toggleView}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>
        <div className="camera-viewport">
          <video ref={cameraFeedRef} className="camera-feed" autoPlay playsInline></video>
          <canvas ref={cameraOverlayRef} className="camera-overlay"></canvas>
          <div ref={cameraFlashRef} className="camera-flash"></div>
        </div>
        <div className="camera-controls">
          <button ref={captureButtonRef} className="capture-button">
            <div className="capture-button-inner"></div>
          </button>
        </div>
      </div>

      {/* Room List View */}
      <div 
        ref={roomListViewRef} 
        className={`view room-list-view ${state.currentView === 'roomList' ? '' : 'hidden'}`}
      >
        <div className="room-list-header">
          <h2>Your Rooms</h2>
          <button 
            className="submit-button-header" 
            onClick={generateQuote}
          >
            Submit Quote
          </button>
        </div>
        <div className="room-list-container">
          <ul ref={roomListRef} className="room-list">
            {Object.entries(state.rooms).map(([roomId, room]) => (
              <li 
                key={roomId} 
                className={`room-item ${state.activeRoom === roomId ? 'active' : ''} ${room.name === 'Classifying...' ? 'classifying' : ''}`}
                onClick={() => handleRoomSelect(roomId)}
              >
                <div className="room-name">
                  {room.name === 'Classifying...' ? (
                    // Uneditable text for classifying rooms
                    <div className="classifying-label">
                      <span>Classifying...</span>
                      <div className="classifying-spinner"></div>
                    </div>
                  ) : (
                    // Editable input for normal rooms
                    <input
                      type="text"
                      value={room.name}
                      onChange={(e) => handleRoomNameChange(roomId, e.target.value)}
                      onBlur={() => saveRoomName(roomId, room.name)}
                      onFocus={(e) => setState(prev => ({ 
                        ...prev, 
                        activeInputField: { 
                          roomId: roomId, 
                          element: e.currentTarget 
                        } 
                      }))}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </div>
                <div className="room-info">
                  <span>{room.images?.length || 0} images</span>
                  {room.processed && <span className="processed-badge">Processed</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="model-viewer-container">
          <div ref={modelViewerRef} className="model-viewer">
            {/* 3D model will be rendered here */}
          </div>
          <div ref={loadingIndicatorRef} className="loading-indicator hidden">
            <div className="spinner"></div>
            <p>Processing room...</p>
            <p className="loading-subtitle">This may take a few minutes</p>
          </div>
          {/* Camera button moved to middle */}
          <button 
            ref={cameraButtonRef} 
            className={`camera-button camera-button-middle ${isProcessingAnyRoom() ? 'disabled' : ''}`}
            onClick={() => !isProcessingAnyRoom() && setState(prev => ({ ...prev, currentView: 'camera' }))}
            disabled={isProcessingAnyRoom()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
          </button>
        </div>
      </div>
      
      {/* Quote View */}
      <div 
        className={`view quote-view ${state.currentView === 'quote' ? '' : 'hidden'}`}
      >
        <div className="quote-header">
          <h2>Your Quote from {painter?.businessName || 'Your Provider'}:</h2>
        </div>
        
        <div className="quote-items">
          {state.quoteItems?.map((item, index) => (
            <div key={index} className="quote-item">
              <span className="quote-item-description">{item.description}</span>
              <span className="quote-item-amount">${item.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
        
        <div className="quote-total">
          <span className="quote-total-label">Total:</span>
          <span className="quote-total-amount">${state.totalQuoteAmount?.toFixed(2) || '0.00'}</span>
        </div>
        
        <button className="accept-quote-button" onClick={() => console.log('Quote accepted')}>
          Accept Quote
        </button>
      </div>
    </div>
  );
}
