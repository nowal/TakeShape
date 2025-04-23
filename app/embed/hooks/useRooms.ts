import { useState, useEffect, useRef } from 'react';
import { Room } from '@/app/demo/types';
import { uploadFiles } from '@/utils/firestore/storage';

// API base URL for Flask backend
const API_BASE_URL = '/api/flask';

interface UseRoomsProps {
  sessionId: string | null;
  houseId: string | null;
}

interface UseRoomsReturn {
  rooms: Record<string, Room>;
  temporaryRooms: Record<string, Room>;
  activeRoom: string | null;
  classifyingRooms: string[];
  classifiedRoomNames: Record<string, string>;
  processingRoom: string | null;
  isProcessingAnyRoom: boolean;
  loadRooms: () => Promise<void>;
  handleRoomSelect: (roomId: string) => void;
  handleRoomNameChange: (roomId: string, name: string) => void;
  saveRoomName: (roomId: string, name: string) => Promise<void>;
  processImages: (images: Blob[], roomName?: string) => Promise<void>;
  loadModel: (roomId: string, modelPath: string) => void;
  setModelViewerRef: (ref: HTMLDivElement | null) => void;
  setLoadingIndicatorRef: (ref: HTMLDivElement | null) => void;
}

/**
 * Hook for managing rooms, processing, and 3D models
 */
export const useRooms = ({ sessionId, houseId }: UseRoomsProps): UseRoomsReturn => {
  // State for rooms
  const [rooms, setRooms] = useState<Record<string, Room>>({});
  const [temporaryRooms, setTemporaryRooms] = useState<Record<string, Room>>({});
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [classifyingRooms, setClassifyingRooms] = useState<string[]>([]);
  const [classifiedRoomNames, setClassifiedRoomNames] = useState<Record<string, string>>({});
  const [processingRoom, setProcessingRoom] = useState<string | null>(null);
  
  // Refs for DOM elements
  const modelViewerRef = useRef<HTMLDivElement | null>(null);
  const loadingIndicatorRef = useRef<HTMLDivElement | null>(null);
  
  // Set refs from outside
  const setModelViewerRefExternal = (ref: HTMLDivElement | null) => {
    modelViewerRef.current = ref;
  };
  
  const setLoadingIndicatorRefExternal = (ref: HTMLDivElement | null) => {
    loadingIndicatorRef.current = ref;
  };
  
  // Polling interval for room updates
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Check if any room is being processed
  const isProcessingAnyRoom = () => {
    return (
      processingRoom !== null || // 3D model still processing
      Object.values(rooms).some(room => room.name === 'Classifying...') || // Room still classifying in Firestore
      Object.values(temporaryRooms).length > 0 || // Any temporary rooms (which are all "Classifying...")
      classifyingRooms.length > 0 // Rooms being classified
    );
  };
  
  // Load rooms from server
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
      setRooms(prevRooms => {
        // Get the rooms from the server
        const serverRooms = data.rooms || {};
        
        // Create a new rooms object that preserves classified names
        const updatedRooms: Record<string, Room> = {};
        
        // Process each room from the server
        Object.entries(serverRooms).forEach(([roomId, serverRoom]) => {
          const room = serverRoom as Room;
          
          // Check if we have a classified name for this room
          if (roomId in classifiedRoomNames) {
            // Use the classified name instead of the server name
            updatedRooms[roomId] = {
              ...room,
              name: classifiedRoomNames[roomId]
            };
            console.log(`Using classified name for room ${roomId}: ${classifiedRoomNames[roomId]}`);
          } else {
            // Use the server name
            updatedRooms[roomId] = room;
          }
        });
        
        return updatedRooms;
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
  
  // Handle room selection
  const handleRoomSelect = (roomId: string) => {
    setActiveRoom(roomId);
    
    // Check if this is a room in Firestore or a temporary room
    const room = rooms[roomId] || temporaryRooms[roomId];
    
    // Load the 3D model if available (only for Firestore rooms)
    if (room && 'model_path' in room && room.model_path) {
      loadModel(roomId, room.model_path);
    }
  };
  
  // Handle room name change
  const handleRoomNameChange = (roomId: string, name: string) => {
    // Check if this is a room in Firestore or a temporary room
    if (roomId in rooms) {
      // Update name for a Firestore room
      setRooms(prevRooms => ({
        ...prevRooms,
        [roomId]: {
          ...prevRooms[roomId],
          name
        }
      }));
    } else if (roomId in temporaryRooms) {
      // Update name for a temporary room
      setTemporaryRooms(prevRooms => ({
        ...prevRooms,
        [roomId]: {
          ...prevRooms[roomId],
          name
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
      if (roomId in rooms) {
        // Update room name in Firestore directly
        const response = await fetch(`/api/rooms/update-name`, {
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
        setRooms(prevRooms => ({
          ...prevRooms,
          [roomId]: {
            ...prevRooms[roomId],
            name
          }
        }));
        
        console.log('Room name saved successfully to Firestore');
      } else if (roomId in temporaryRooms) {
        // For temporary rooms, just update the local state
        setTemporaryRooms(prevRooms => ({
          ...prevRooms,
          [roomId]: {
            ...prevRooms[roomId],
            name
          }
        }));
        
        console.log('Temporary room name updated in local state');
      }
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
  
  // Process images to create a new room
  const processImages = async (images: Blob[], roomName = 'Classifying...') => {
    if (!sessionId || images.length === 0) return;
    
    try {
      // Show loading indicator
      if (loadingIndicatorRef.current) {
        loadingIndicatorRef.current.classList.remove('hidden');
      }
      
      // Generate a new room ID
      const newRoomId = `room_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      console.log(`Created new room with ID: ${newRoomId}, name: ${roomName}`);
      
      // Create a temporary room entry in local state
      setTemporaryRooms(prevRooms => ({
        ...prevRooms,
        [newRoomId]: {
          id: newRoomId,
          name: roomName,
          sessionId: sessionId,
          images: [],
          created_at: Date.now(),
          processed: false
        }
      }));
      
      setActiveRoom(newRoomId);
      setProcessingRoom(newRoomId);
      setClassifyingRooms(prev => [...prev, newRoomId]);
      
      // Start polling for room name updates
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      
      pollingIntervalRef.current = setInterval(async () => {
        console.log('Polling for room updates...');
        await loadRooms();
      }, 2000);
      
      // Create form data for direct processing
      const formData = new FormData();
      formData.append('sessionId', sessionId);
      formData.append('roomId', newRoomId);
      formData.append('roomName', roomName);
      
      // Add all images to the form data
      images.forEach((blob, index) => {
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
      const imagesToClassify = images.slice(0, 4);
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
            setClassifiedRoomNames(prev => ({
              ...prev,
              [newRoomId]: data.roomType
            }));
            
            // Upload images to Firebase Storage
            console.log('Uploading images to Firebase Storage');
            const storageBasePath = `rooms/${sessionId}/${newRoomId}`;
            const imageUrls = await uploadFiles(images, storageBasePath);
            console.log(`Uploaded ${imageUrls.length} images to Firebase Storage:`, imageUrls);
            
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
              setRooms(prevRooms => ({
                ...prevRooms,
                [newRoomId]: createdRoomData.room || {
                  id: newRoomId,
                  name: data.roomType,
                  sessionId: sessionId,
                  images: [],
                  created_at: Date.now()
                }
              }));
              
              setTemporaryRooms(prevRooms => {
                const { [newRoomId]: _, ...rest } = prevRooms;
                return rest;
              });
              
              setClassifyingRooms(prev => prev.filter(id => id !== newRoomId));
              
              // Reload rooms from Firestore to ensure we have the latest data
              await loadRooms();
              
              return { success: true, roomType: data.roomType };
            } else {
              console.warn('Failed to create room in Firestore:', await createRoomResponse.text());
              return { success: false, roomType: data.roomType };
            }
          }
          
          return { success: false, roomType: null };
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
        })
      ];
      
      // Wait for both processes to complete
      const [classifyResult, flaskResult] = await Promise.all([classifyPromise, flaskPromise]);
      
      // Handle 3D reconstruction result
      if (flaskResult.success && 'data' in flaskResult) {
        const data = flaskResult.data;
        
        // Reload rooms from Firestore to get the latest data
        await loadRooms();
        
        // Load the 3D model
        loadModel(newRoomId, data.modelPath);
        
        // Update the room in Firestore with the processed flag and model path only
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
          })
        });
        
        // Update local state - only update processed and model_path fields
        setRooms(prevRooms => {
          // Get the current room from state to ensure we have the latest data
          const existingRoom = prevRooms[newRoomId] || {};
          
          return {
            ...prevRooms,
            [newRoomId]: {
              ...existingRoom, // Preserve all existing fields including name
              processed: true,
              model_path: data.modelPath
            }
          };
        });
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
        if (modelViewerRef.current) {
          const errorDisplay = document.createElement('div');
          errorDisplay.className = 'error-message';
          errorDisplay.innerHTML = `
            <p>Error processing 3D model</p>
            <p class="error-details">${errorMessage}</p>
          `;
          
          modelViewerRef.current.innerHTML = '';
          modelViewerRef.current.appendChild(errorDisplay);
        }
      }
      
      // Clear the polling interval
      if (pollingIntervalRef.current) {
        console.log('Clearing polling interval');
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      
      // Reset processing state
      setProcessingRoom(null);
      
      // Hide loading indicator
      if (loadingIndicatorRef.current) {
        loadingIndicatorRef.current.classList.add('hidden');
      }
    } catch (error) {
      // Type guard for Error objects
      const err = error instanceof Error ? error : new Error(String(error));
      
      console.error('Error processing images:', {
        message: err.message,
        name: err.name,
        stack: err.stack
      });
      
      // Show a more detailed error message
      alert(`Error processing images: ${err.message}`);
      
      // Hide loading indicator
      if (loadingIndicatorRef.current) {
        loadingIndicatorRef.current.classList.add('hidden');
      }
      
      // Clear the polling interval if it exists
      if (pollingIntervalRef.current) {
        console.log('Clearing polling interval due to error');
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      
      // Reset processing state
      setProcessingRoom(null);
    }
  };
  
  // Load 3D model
  const loadModel = (roomId: string, modelPath: string) => {
    console.log(`Loading model for room ${roomId}: ${modelPath}`);
    
    if (!modelPath || !modelViewerRef.current) {
      console.error('No model path provided or model viewer ref is null');
      return;
    }
    
    // Clear any existing content in the model viewer
    modelViewerRef.current.innerHTML = '';
    
    try {
      // Check if model-viewer is defined
      if (typeof customElements === 'undefined' || !customElements.get('model-viewer')) {
        console.warn('model-viewer custom element is not defined yet. Waiting for it to load...');
        
        // Add a message to the model viewer
        modelViewerRef.current.innerHTML = `
          <div class="loading">
            <p>Loading 3D viewer...</p>
            <div class="spinner"></div>
          </div>
        `;
        
        // Try again in 1 second
        setTimeout(() => loadModel(roomId, modelPath), 1000);
        return;
      }
      
      // Create a model-viewer element
      const modelViewer = document.createElement('model-viewer');
      
      // Add attributes
      modelViewer.setAttribute('src', modelPath);
      modelViewer.setAttribute('alt', `3D model of ${rooms[roomId]?.name || 'room'}`);
      modelViewer.setAttribute('auto-rotate', '');
      modelViewer.setAttribute('camera-controls', '');
      modelViewer.setAttribute('style', 'width: 100%; height: 100%;');
      modelViewer.setAttribute('shadow-intensity', '1');
      modelViewer.setAttribute('exposure', '0.5');
      modelViewer.setAttribute('point-size', '1.0');
      modelViewer.setAttribute('background-color', '#000000');
      
      // Add debugging info
      console.log('Model-viewer element created with attributes:', {
        src: modelViewer.getAttribute('src'),
        alt: modelViewer.getAttribute('alt'),
        autoRotate: modelViewer.hasAttribute('auto-rotate'),
        cameraControls: modelViewer.hasAttribute('camera-controls')
      });
      
      // Add the model-viewer to the DOM
      modelViewerRef.current.appendChild(modelViewer);
      console.log('Model-viewer element added to DOM');
      
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
  
  // Load rooms on mount and when sessionId changes
  useEffect(() => {
    if (sessionId) {
      loadRooms();
    }
    
    // Cleanup function
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [sessionId]);
  
  return {
    rooms,
    temporaryRooms,
    activeRoom,
    classifyingRooms,
    classifiedRoomNames,
    processingRoom,
    isProcessingAnyRoom: isProcessingAnyRoom(),
    loadRooms,
    handleRoomSelect,
    handleRoomNameChange,
    saveRoomName,
    processImages,
    loadModel,
    setModelViewerRef: setModelViewerRefExternal,
    setLoadingIndicatorRef: setLoadingIndicatorRefExternal
  };
};
