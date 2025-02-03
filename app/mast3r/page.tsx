/* eslint-disable @typescript-eslint/no-namespace */

'use client';

import { useState } from 'react';
import FloorPlanViewer from './FloorPlanViewer';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}

interface WallSegment {
  points: number[][];
  local_points: number[][];
  transform: number[][];
  height: number;
  width: number;
}

export default function MastPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [walls, setWalls] = useState<WallSegment[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files);
      const imageFiles = selectedFiles.filter(file => file.type.startsWith('image/'));
      setFiles(imageFiles);
      if (imageFiles.length < selectedFiles.length) {
        setErrorMessage('Some files were skipped because they were not images');
      }
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    try {
      setIsProcessing(true);
      setErrorMessage(null);

      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });

      const response = await fetch('http://104.171.203.98:8000/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Processing failed');

      const data = await response.json();
      console.log('Received data:', data);
      
      setModelUrl(`http://104.171.203.98:8000${data.model_url}`);
      if (data.walls && data.walls.length > 0) {
        setWalls(data.walls);
        console.log('Wall data:', data.walls);
      }

    } catch (error) {
      console.error('Error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="image-upload"
              multiple
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer flex flex-col items-center space-y-2"
            >
              <div className="text-4xl">📁</div>
              <span className="text-gray-600">
                {files.length > 0 
                  ? `${files.length} images selected` 
                  : 'Click to upload images'}
              </span>
            </label>
          </div>

          {files.length > 0 && (
            <button
              onClick={handleUpload}
              disabled={isProcessing}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg disabled:bg-gray-300"
            >
              {isProcessing ? 'Processing...' : 'Process Images'}
            </button>
          )}

          {errorMessage && (
            <div className="text-red-500 text-center p-2">
              {errorMessage}
            </div>
          )}

          {modelUrl && (
            <div className="aspect-square w-full border rounded-lg overflow-hidden">
              <model-viewer
                src={modelUrl}
                auto-rotate
                camera-controls
                exposure="0.75"
                shadow-intensity="1"
                camera-orbit="0deg 75deg 105%"
                bounds="tight"
                min-field-of-view="10deg"
                max-field-of-view="90deg"
                interpolation-decay="200"
                className="w-full h-full"
                style={{
                  backgroundColor: '#000000',
                  '--poster-color': '#000000',
                }}
              />
            </div>
          )}
        </div>

        {/*<div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Floor Plan View</h2>
          </div>
          
          {walls.length > 0 && <FloorPlanViewer walls={walls} />}
        </div>*/}
      </div>
    </div>
  );
}