'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Room } from '@/utils/firestore/house';

interface RoomViewerProps {
  rooms: Room[];
}

export const RoomViewer: React.FC<RoomViewerProps> = ({ rooms }) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const modelViewerRef = useRef<HTMLDivElement>(null);

  // Set the first room as selected by default
  useEffect(() => {
    if (rooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(rooms[0].id);
    }
  }, [rooms, selectedRoomId]);

  // Load the 3D model when the selected room changes
  useEffect(() => {
    if (!selectedRoomId) return;
    
    const selectedRoom = rooms.find(room => room.id === selectedRoomId);
    if (selectedRoom && selectedRoom.model_path) {
      loadModel(selectedRoom.model_path);
    }
  }, [selectedRoomId, rooms]);

  // Load the 3D model
  const loadModel = (modelPath: string) => {
    if (!modelPath || !modelViewerRef.current) return;
    
    // Clear any existing content
    modelViewerRef.current.innerHTML = '';
    
    try {
      // Check if model-viewer is defined
      if (typeof customElements === 'undefined' || !customElements.get('model-viewer')) {
        console.warn('model-viewer custom element is not defined yet');
        
        // Add a message to the model viewer
        modelViewerRef.current.innerHTML = `
          <div class="flex items-center justify-center h-full">
            <p class="text-gray-500">Loading 3D viewer...</p>
          </div>
        `;
        
        // Try again in 1 second
        setTimeout(() => loadModel(modelPath), 1000);
        return;
      }
      
      // Create a model-viewer element
      const modelViewer = document.createElement('model-viewer');
      
      // Add attributes
      modelViewer.setAttribute('src', modelPath);
      modelViewer.setAttribute('alt', 'Room 3D model');
      modelViewer.setAttribute('auto-rotate', '');
      modelViewer.setAttribute('camera-controls', '');
      modelViewer.setAttribute('style', 'width: 100%; height: 100%;');
      modelViewer.setAttribute('shadow-intensity', '1');
      modelViewer.setAttribute('exposure', '0.5');
      
      // Add the model-viewer to the DOM
      modelViewerRef.current.appendChild(modelViewer);
      
      // Add event listeners for loading and error states
      modelViewer.addEventListener('load', () => {
        console.log('Model loaded successfully');
      });
      
      modelViewer.addEventListener('error', (error) => {
        console.error('Error loading model:', error);
        
        // Show error message in the model viewer
        if (modelViewerRef.current) {
          modelViewerRef.current.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full">
              <p class="text-red-500">Error loading 3D model</p>
              <p class="text-gray-500">Please try again later</p>
            </div>
          `;
        }
      });
    } catch (error) {
      console.error('Error setting up model viewer:', error);
      
      // Show error message in the model viewer
      if (modelViewerRef.current) {
        modelViewerRef.current.innerHTML = `
          <div class="flex flex-col items-center justify-center h-full">
            <p class="text-red-500">Error setting up 3D viewer</p>
            <p class="text-gray-500">Please try again later</p>
          </div>
        `;
      }
    }
  };

  return (
    <div className="w-full">
      {rooms.length > 0 ? (
        <>
          <div className="mb-2">
            <select
              value={selectedRoomId || ''}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>
          <div 
            ref={modelViewerRef} 
            className="w-full h-64 border border-gray-300 rounded-md overflow-hidden bg-gray-100"
          >
            {/* 3D model will be rendered here */}
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Loading 3D model...</p>
            </div>
          </div>
        </>
      ) : (
        <div className="w-full h-64 border border-gray-300 rounded-md flex items-center justify-center bg-gray-100">
          <p className="text-gray-500">No rooms available</p>
        </div>
      )}
    </div>
  );
};

export default RoomViewer;
