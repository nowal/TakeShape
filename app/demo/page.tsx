'use client';

import { useState, useEffect, useRef, FC } from 'react';
import { Room, RoomState, ThreeRef, QuoteItem, AddOnConfirmation as AddOnConfirmationType } from './types';
import { useSession } from '@/context/session/provider';
import Chat from '@/components/chat';
import HomeownerIntake from '@/components/demo/homeowner-intake';
import AddOnConfirmation from '@/components/demo/addon-confirmation';
import { getPainter, Painter } from '@/utils/firestore/painter';
import { getPricingSheetByProviderId, PricingSheet } from '@/utils/firestore/pricingSheet';
import { addAddOnToHouse } from '@/utils/firestore/house';
import './RoomScanner.css';
import { uploadFiles } from '@/utils/firestore/storage';

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
    totalQuoteAmount: 0, // Total quote amount
    temporaryRooms: {}, // Rooms that exist in UI only before Firestore creation
    classifyingRooms: [], // Array of room IDs that are being classified
    classifiedRoomNames: {}, // Store the classified names for rooms to prevent overwriting
    dropdownOpen: false, // Whether the room dropdown is open
    currentAddOnConfirmation: null, // Current add-on being confirmed
    pendingAddOnConfirmations: [] // Queue of add-ons waiting for confirmation
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
    /*return (
      state.processingRoom !== null || // 3D model still processing
      Object.values(state.rooms).some(room => room.name === 'Classifying...') || // Room still classifying in Firestore
      Object.values(state.temporaryRooms).length > 0 || // Any temporary rooms (which are all "Classifying...")
      state.classifyingRooms.length > 0 || // Rooms being classified
      state.analyzingAddOnsForRooms.length > 0 // Add-on analysis in progress
    );*/
    return false;
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
      console.log('Initializing camera with environment facing mode and widest possible view');
      
      // First, enumerate all video devices to find the back cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      console.log('Available video devices:', videoDevices.map(d => ({
        deviceId: d.deviceId,
        groupId: d.groupId,
        label: d.label || 'Unlabeled Camera'
      })));
      
      // Start with strict constraints to force back camera
      const strictConstraints = {
        video: {
          facingMode: { exact: 'environment' }, // Force back camera
          width: { ideal: 4032 }, // Request maximum width
          height: { ideal: 3024 }, // Request maximum height
        }
      } as MediaStreamConstraints;
      
      console.log('Attempting to access back camera with strict constraints:', strictConstraints);
      
      try {
        // First try with strict constraints
        const stream = await navigator.mediaDevices.getUserMedia(strictConstraints);
        console.log('Successfully accessed back camera with strict constraints');
        
        if (cameraFeedRef.current) {
          cameraFeedRef.current.srcObject = stream;
        }
        
        // Try to set the zoom to minimum (widest view)
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          console.log('Video track info:', {
            label: videoTrack.label,
            id: videoTrack.id,
            kind: videoTrack.kind,
            enabled: videoTrack.enabled,
            muted: videoTrack.muted,
          });
          
          // Log detailed capabilities
          if ('getCapabilities' in videoTrack) {
            const capabilities = videoTrack.getCapabilities();
            console.log('Camera capabilities:', capabilities);
            
            // If zoom is supported, set it to the minimum value (widest field of view)
            const capabilitiesAny = capabilities as any;
            if (capabilitiesAny.zoom) {
              console.log(`Setting zoom to minimum value: ${capabilitiesAny.zoom.min}`);
              
              try {
                // Use type assertion to handle non-standard properties
                await videoTrack.applyConstraints({
                  advanced: [{ zoom: capabilitiesAny.zoom.min } as any]
                } as MediaTrackConstraints);
                
                console.log('Successfully set minimum zoom');
              } catch (zoomError) {
                console.error('Error setting zoom:', zoomError);
              }
            } else {
              console.log('Camera does not support zoom capability');
            }
            
            // If we have a wide-angle camera option, try to use it
            if (capabilitiesAny.facingMode && 
                Array.isArray(capabilitiesAny.facingMode) && 
                capabilitiesAny.facingMode.includes('environment-ultra-wide')) {
              console.log('Ultra-wide back camera detected, attempting to use it');
              
              try {
                await videoTrack.applyConstraints({
                  facingMode: 'environment-ultra-wide'
                } as MediaTrackConstraints);
                
                console.log('Successfully switched to ultra-wide camera');
              } catch (ultraWideError) {
                console.error('Error switching to ultra-wide camera:', ultraWideError);
              }
            }
          } else {
            console.log('getCapabilities not supported on this device/browser');
          }
        }
        
        // Update state with the stream
        setState(prevState => ({
          ...prevState,
          stream
        }));
        
        console.log('Camera initialized successfully with back camera');
        return; // Exit early since we successfully got the back camera
      } catch (strictError) {
        console.warn('Failed to access camera with strict constraints:', strictError);
        console.log('Falling back to less strict constraints...');
      }
      
      // Fallback to less strict constraints if the above fails
      const fallbackConstraints = {
        video: {
          facingMode: 'environment', // Prefer back camera but don't require it
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      } as MediaStreamConstraints;
      
      console.log('Requesting camera access with fallback constraints:', fallbackConstraints);
      
      const fallbackStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
      console.log('Camera access granted with fallback constraints');
      
      if (cameraFeedRef.current) {
        cameraFeedRef.current.srcObject = fallbackStream;
      }
      
      // Update state with the fallback stream
      setState(prevState => ({
        ...prevState,
        stream: fallbackStream
      }));
      
      console.log('Camera initialized with fallback settings');
      
      // Try to identify if we got a back camera or front camera
      const videoTrack = fallbackStream.getVideoTracks()[0];
      if (videoTrack) {
        console.log('Using camera:', videoTrack.label);
        // Most devices include "back" or "rear" in the label for back cameras
        const isLikelyBackCamera = videoTrack.label.toLowerCase().includes('back') || 
                                  videoTrack.label.toLowerCase().includes('rear') ||
                                  !videoTrack.label.toLowerCase().includes('front');
        
        console.log(`Camera appears to be a ${isLikelyBackCamera ? 'back' : 'front'} camera based on label`);
        
        if (!isLikelyBackCamera) {
          console.warn('WARNING: May be using front camera instead of back camera');
          // Show a warning to the user
          alert('Warning: Your device may be using the front camera. For best results, please use the back camera.');
        }
      }
    } catch (error) {
      // Type guard for Error objects
      const err = error instanceof Error ? error : new Error(String(error));
      
      console.error('Error accessing camera:', {
        message: err.message,
        name: err.name,
        stack: err.stack
      });
      
      // Show a more detailed error message
      alert(`Unable to access camera: ${err.message}. Please ensure camera permissions are granted and try again.`);
      
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
      
      // Update state with server data, but preserve classified names
      setState(prevState => {
        // Get the rooms from the server
        const serverRooms = data.rooms || {};
        
        // Create a new rooms object that preserves classified names
        const updatedRooms: Record<string, Room> = {};
        
        // Process each room from the server
        Object.entries(serverRooms).forEach(([roomId, serverRoom]) => {
          const room = serverRoom as Room;
          
          // Check if we have a classified name for this room
          if (roomId in prevState.classifiedRoomNames) {
            // Use the classified name instead of the server name
            updatedRooms[roomId] = {
              ...room,
              name: prevState.classifiedRoomNames[roomId]
            };
            console.log(`Using classified name for room ${roomId}: ${prevState.classifiedRoomNames[roomId]}`);
          } else {
            // Use the server name
            updatedRooms[roomId] = room;
          }
        });
        
        return {
          ...prevState,
          rooms: updatedRooms
        };
      });
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
      
      // Create a temporary room entry in local state only
      // This will be visible in the UI while the room is being classified
      setState(prevState => ({
        ...prevState,
        temporaryRooms: {
          ...prevState.temporaryRooms,
          [newRoomId]: {
            id: newRoomId,
            name: roomName,
            sessionId: sessionId,
            images: [],
            created_at: Date.now(),
            processed: false
          }
        },
        activeRoom: newRoomId,
        processingRoom: newRoomId,
        classifyingRooms: [...prevState.classifyingRooms, newRoomId]
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
      
      // Create a separate FormData for Claude classification
      const classifyFormData = new FormData();
      classifyFormData.append('sessionId', sessionId);
      classifyFormData.append('roomId', newRoomId);
      
      // Add images to the classify form data (limit to 4 for Claude)
      const imagesToClassify = pendingImages.slice(0, 4);
      imagesToClassify.forEach((blob, index) => {
        const filename = `image_${Date.now()}_${index}.jpg`;
        classifyFormData.append(`image${index}`, blob, filename);
      });
      
      console.log('Starting concurrent processing:');
      console.log('1. Sending images to Claude for classification');
      console.log('2. Sending images to Flask for 3D reconstruction');
      
      // Run both processes concurrently
      const [classifyPromise, flaskPromise] = [
        // 1. Claude Classification
        fetch('/api/classify-room', {
          method: 'POST',
          body: classifyFormData
        }).then(async response => {
          if (!response.ok) {
            console.warn('Room classification failed:', response.status, response.statusText);
            return { success: false, roomType: null };
          }
          
          const data = await response.json();
          console.log('Classification result:', data);
          
          if (data.roomType) {
            // Classification complete - now create the room in Firestore with the correct name
            console.log(`Room classified as: ${data.roomType}`);
            
            // Store the classified name in state to prevent it from being overwritten
            setState(prevState => ({
              ...prevState,
              classifiedRoomNames: {
                ...prevState.classifiedRoomNames,
                [newRoomId]: data.roomType
              }
            }));
            
            // Upload images to Firebase Storage
            console.log('Uploading images to Firebase Storage');
            const storageBasePath = `rooms/${sessionId}/${newRoomId}`;
            const imageUrls = await uploadFiles(pendingImages, storageBasePath);
            console.log(`Uploaded ${imageUrls.length} images to Firebase Storage:`, imageUrls);
            
            console.log(`Converted ${imageUrls.length} images to data URLs`);
            
            // Use the dedicated create endpoint instead of update
            const createRoomResponse = await fetch('/api/rooms/create', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                sessionId,
                roomId: newRoomId,
                name: data.roomType,
                created_at: Date.now(),
                images: imageUrls // Include the image data URLs
              })
            });
            
            if (createRoomResponse.ok) {
              console.log('Room created in Firestore with classified name');
              
              // Get the created room data from the response
              const createdRoomData = await createRoomResponse.json();
              console.log('Created room data:', createdRoomData);
              
              // Update local state - add to rooms and remove from temporaryRooms
              setState(prevState => {
                // Create a copy of temporaryRooms without the current room
                const { [newRoomId]: _, ...remainingTempRooms } = prevState.temporaryRooms;
                
                return {
                  ...prevState,
                  // Add to real rooms with the classified name
                  rooms: {
                    ...prevState.rooms,
                    [newRoomId]: createdRoomData.room || {
                      id: newRoomId,
                      name: data.roomType,
                      sessionId: sessionId,
                      images: [],
                      created_at: Date.now()
                    }
                  },
                  // Remove from temporary rooms
                  temporaryRooms: remainingTempRooms,
                  // Remove from classifying rooms
                  classifyingRooms: prevState.classifyingRooms.filter(id => id !== newRoomId)
                };
              });
              
              // Reload rooms from Firestore to ensure we have the latest data
              await loadRooms();
              
              return { success: true, roomType: data.roomType };
            } else {
              console.warn('Failed to create room in Firestore:', await createRoomResponse.text());
              return { success: false, roomType: data.roomType };
            }
          }
          
          return { success: false, roomType: null };
        }).catch(error => {
          console.error('Error during room classification:', error);
          return { success: false, error };
        }),
        
        // 2. Flask 3D Reconstruction
        fetch(`${API_BASE_URL}/direct-process`, {
          method: 'POST',
          body: formData,
          headers: {
            'X-Client-Info': 'TakeShape-Demo-App'
          }
        }).then(async response => {
          if (!response.ok) {
            // Try to get more details from the error response
            let errorDetails = '';
            try {
              const errorData = await response.json();
              errorDetails = JSON.stringify(errorData);
            } catch (e) {
              try {
                errorDetails = await response.text();
              } catch (e2) {
                errorDetails = 'Could not read error response';
              }
            }
            
            return { 
              success: false, 
              status: response.status, 
              details: errorDetails 
            };
          }
          
          // Parse the response JSON
          try {
            const data = await response.json();
            console.log('3D reconstruction response:', data);
            
            if (!data.modelPath) {
              return { 
                success: false, 
                error: 'Missing modelPath in response' 
              };
            }
            
            return { success: true, data };
          } catch (jsonError) {
            const error = jsonError as Error;
            return { 
              success: false, 
              error: 'Invalid JSON response', 
              details: error.message 
            };
          }
        }).catch(error => {
          return { 
            success: false, 
            error: error.message, 
            name: error.name 
          };
        })
      ];
      
      // Start both processes concurrently, but handle classification result immediately when it completes
      const classifyResult = await classifyPromise;
      console.log('Classification result:', classifyResult);
      
      // If classification was successful, search for add-ons immediately
      if (classifyResult.success && 'roomType' in classifyResult && classifyResult.roomType) {
        // Add room to analyzingAddOnsForRooms
        setState(prevState => ({
          ...prevState,
          analyzingAddOnsForRooms: [...prevState.analyzingAddOnsForRooms, newRoomId]
        }));
        
        try {
          console.log('Searching for add-ons with the new API endpoint');
          
          // Use the new search-addons API endpoint
          const searchAddOnsResponse = await fetch('/api/search-addons', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              sessionId,
              roomId: newRoomId,
              providerId: DEMO_PAINTER_ID
            })
          });
          
          if (!searchAddOnsResponse.ok) {
            throw new Error(`HTTP error! Status: ${searchAddOnsResponse.status}`);
          }
          
          const addOnsData = await searchAddOnsResponse.json();
          console.log('Add-ons search result:', addOnsData);
          
          // If add-ons were found, queue them for confirmation
          /*if (addOnsData.addOns && addOnsData.addOns.length > 0) {
            setState(prevState => ({
              ...prevState,
              pendingAddOnConfirmations: addOnsData.addOns
            }));
            
            // Show the first add-on confirmation
            if (addOnsData.addOns.length > 0) {
              setState(prevState => ({
                ...prevState,
                currentAddOnConfirmation: addOnsData.addOns[0]
              }));
            }
          }*/
        } catch (error) {
          console.error('Error searching for add-ons:', error);
        } finally {
          // Remove room from analyzingAddOnsForRooms when done
          setState(prevState => ({
            ...prevState,
            analyzingAddOnsForRooms: prevState.analyzingAddOnsForRooms.filter(id => id !== newRoomId)
          }));
        }
      }
      
      // Wait for the 3D model process to complete
      const flaskResult = await flaskPromise;
      console.log('3D Reconstruction result:', flaskResult);
      
      // Handle 3D reconstruction result
      if (flaskResult.success) {
        // Type guard to check if data property exists
        if ('data' in flaskResult) {
          const data = flaskResult.data;
          
          // Reload rooms from Firestore to get the latest data
          await loadRooms();
          
          // Load the 3D model
          loadModel(newRoomId, data.modelPath);
          
          // Get the current room data to preserve the name
          const currentRoom = state.rooms[newRoomId] || {};
          console.log('Current room data before 3D model update:', currentRoom);
          
          // Update the room in Firestore with the processed flag and model path only
          // Explicitly NOT including the name field to preserve the classified name
          await fetch('/api/rooms/update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              sessionId,
              roomId: newRoomId,
              processed: true,
              model_path: data.modelPath
              // name field intentionally omitted to preserve the classified name
            })
          });
          
          // Update local state - only update processed and model_path fields
          // This preserves all other fields including the name
          setState(prevState => {
            // Get the current room from state to ensure we have the latest data
            const existingRoom = prevState.rooms[newRoomId] || {};
            
            return {
              ...prevState,
              rooms: {
                ...prevState.rooms,
                [newRoomId]: {
                  ...existingRoom, // Preserve all existing fields including name
                  processed: true,
                  model_path: data.modelPath
                }
              }
            };
          });
        } else {
          console.error('Missing data in successful response');
        }
      } else {
        // Flask request completed but with an error
        let errorMessage = 'Unknown error';
        
        // Type guard to check if details property exists
        if ('details' in flaskResult && flaskResult.details) {
          errorMessage = String(flaskResult.details);
        } else if ('error' in flaskResult && flaskResult.error) {
          errorMessage = String(flaskResult.error);
        }
        
        console.error('3D reconstruction failed:', errorMessage);
        
        // Show a more user-friendly error message
        const errorDisplay = document.createElement('div');
        errorDisplay.className = 'error-message';
        errorDisplay.innerHTML = `
          <p>Error processing 3D model</p>
          <p class="error-details">${errorMessage}</p>
          <button class="retry-button">Retry</button>
        `;
        
        if (modelViewerRef.current) {
          modelViewerRef.current.innerHTML = '';
          modelViewerRef.current.appendChild(errorDisplay);
          
          // Add retry button functionality
          const retryButton = errorDisplay.querySelector('.retry-button');
          if (retryButton) {
            retryButton.addEventListener('click', () => {
              // Retry the 3D reconstruction
              processRoom(newRoomId);
            });
          }
        }
      }
      
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
      
      // Show a more detailed error message with mobile-friendly display
      const errorMessage = document.createElement('div');
      errorMessage.className = 'error-message-overlay';
      errorMessage.innerHTML = `
        <div class="error-content">
          <h3>Error Processing Images</h3>
          <p>${err.message}</p>
          <p class="error-details">${err.name}: ${err.stack ? err.stack.split('\n')[0] : 'Unknown error'}</p>
          <button class="error-close">Close</button>
        </div>
      `;
      
      document.body.appendChild(errorMessage);
      
      // Add close button functionality
      const closeButton = errorMessage.querySelector('.error-close');
      if (closeButton) {
        closeButton.addEventListener('click', () => {
          document.body.removeChild(errorMessage);
        });
      }
      
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
    
    // Check if this is a room in Firestore or a temporary room
    const room = state.rooms[roomId] || state.temporaryRooms[roomId];
    
    // Load the 3D model if available (only for Firestore rooms)
    if (room && 'model_path' in room && room.model_path) {
      loadModel(roomId, room.model_path);
    }
  };
  
  // Handle room name change
  const handleRoomNameChange = (roomId: string, name: string) => {
    // Check if this is a room in Firestore or a temporary room
    if (roomId in state.rooms) {
      // Update name for a Firestore room
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
    } else if (roomId in state.temporaryRooms) {
      // Update name for a temporary room
      setState(prevState => ({
        ...prevState,
        temporaryRooms: {
          ...prevState.temporaryRooms,
          [roomId]: {
            ...prevState.temporaryRooms[roomId],
            name
          }
        }
      }));
    }
  };
  
  // Save room name to server
  const saveRoomName = async (roomId: string, name: string) => {
    if (!sessionId) return;
    
    try {
      console.log(`Saving name for room ${roomId}:`, name);
      
      // Check if this is a room in Firestore or a temporary room
      if (roomId in state.rooms) {
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
        
        console.log('Room name saved successfully to Firestore');
      } else if (roomId in state.temporaryRooms) {
        // For temporary rooms, just update the local state
        setState(prevState => ({
          ...prevState,
          temporaryRooms: {
            ...prevState.temporaryRooms,
            [roomId]: {
              ...prevState.temporaryRooms[roomId],
              name
            }
          }
        }));
        
        console.log('Temporary room name updated in local state');
      }
      
      // Update active input field
      setState(prevState => ({
        ...prevState,
        activeInputField: null
      }));
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

  // Handle add-on confirmation
  const handleAddOnConfirmation = async (confirmed: boolean) => {
    if (!state.currentAddOnConfirmation || !houseId) return;
    
    const currentAddOn = state.currentAddOnConfirmation;
    
    if (confirmed) {
      try {
        console.log(`Adding add-on to house: ${currentAddOn.name}`);
        
        // Add the add-on to the house document
        const response = await fetch('/api/house/add-addon', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            houseId,
            addOn: {
              name: currentAddOn.name,
              price: currentAddOn.price,
              roomId: currentAddOn.roomId
            }
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // Add to local state as well
        setState(prevState => ({
          ...prevState,
          addOns: [
            ...prevState.addOns,
            {
              description: currentAddOn.name,
              amount: currentAddOn.price,
              roomId: currentAddOn.roomId
            }
          ]
        }));
        
        console.log('Add-on added successfully');
      } catch (error) {
        console.error('Error adding add-on to house:', error);
      }
    } else {
      console.log(`User declined add-on: ${currentAddOn.name}`);
    }
    
    // Check if there are more add-ons to confirm
    setState(prevState => {
      const remainingAddOns = [...prevState.pendingAddOnConfirmations];
      
      // Remove the current add-on from the queue
      remainingAddOns.shift();
      
      return {
        ...prevState,
        currentAddOnConfirmation: remainingAddOns.length > 0 ? remainingAddOns[0] : null,
        pendingAddOnConfirmations: remainingAddOns
      };
    });
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
      
      {/* Add-on Confirmation Modal */}
      {state.currentAddOnConfirmation && (
        <AddOnConfirmation
          addOn={state.currentAddOnConfirmation}
          onConfirm={handleAddOnConfirmation}
          onClose={() => setState(prev => ({ ...prev, currentAddOnConfirmation: null }))}
        />
      )}
      
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
        <div className="room-dropdown-header">
          <div className="room-dropdown">
            <div 
              className="room-dropdown-trigger"
              onClick={() => setState(prev => ({ ...prev, dropdownOpen: !prev.dropdownOpen }))}
            >
              {/* Show the active room name or a placeholder */}
              {state.activeRoom ? (
                state.rooms[state.activeRoom]?.name === 'Classifying...' || 
                state.temporaryRooms[state.activeRoom]?.name === 'Classifying...' ? (
                  <div className="classifying-label">
                    <span>Classifying...</span>
                    <div className="classifying-spinner"></div>
                  </div>
                ) : (
                  <span>
                    {state.activeRoom in state.classifiedRoomNames 
                      ? state.classifiedRoomNames[state.activeRoom] 
                      : state.rooms[state.activeRoom]?.name || 
                        state.temporaryRooms[state.activeRoom]?.name || 
                        'Select a room'}
                  </span>
                )
              ) : (
                <span>Select a room</span>
              )}
              <svg 
                className={`dropdown-arrow ${state.dropdownOpen ? 'open' : ''}`} 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            
            {/* Dropdown menu */}
            {state.dropdownOpen && (
              <div className="room-dropdown-menu">
                {[
                  ...Object.entries(state.rooms).map(([id, room]) => ({ id, room, source: 'firestore' })),
                  ...Object.entries(state.temporaryRooms).map(([id, room]) => ({ id, room, source: 'temp' }))
                ].map(({ id: roomId, room, source }) => (
                  <div 
                    key={`${source}-${roomId}`} 
                    className={`dropdown-item ${state.activeRoom === roomId ? 'active' : ''} ${room.name === 'Classifying...' ? 'classifying' : ''}`}
                    onClick={() => {
                      handleRoomSelect(roomId);
                      setState(prev => ({ ...prev, dropdownOpen: false }));
                    }}
                  >
                    {/* Check if this room is being classified */}
                    {room.name === 'Classifying...' ? (
                      // Uneditable text for classifying rooms
                      <div className="classifying-label">
                        <span>Classifying...</span>
                        <div className="classifying-spinner"></div>
                      </div>
                    ) : (
                      // Editable input for normal rooms
                      // Use the classified name if available, otherwise use the room name
                      <input
                        type="text"
                        value={roomId in state.classifiedRoomNames ? state.classifiedRoomNames[roomId] : room.name}
                        onChange={(e) => handleRoomNameChange(roomId, e.target.value)}
                        onBlur={() => saveRoomName(roomId, roomId in state.classifiedRoomNames ? state.classifiedRoomNames[roomId] : room.name)}
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
                ))}
              </div>
            )}
          </div>
          
          <button 
            className="submit-button-header" 
            onClick={generateQuote}
          >
            Submit
          </button>
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