'use client';

import { useState, useRef } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}

export default function MastPage() {
  const [video, setVideo] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const extractFrames = async (videoFile: File, numFrames: number = 10): Promise<File[]> => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(videoFile);
    await new Promise<void>(resolve => { video.onloadedmetadata = () => resolve(); });
    
    const duration = video.duration;
    const interval = duration / numFrames;
    const frames: File[] = [];
    
    const canvas = canvasRef.current;
    if (!canvas) return [];
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];
    
    canvas.width = 640;
    canvas.height = 480;

    for (let i = 0; i < numFrames; i++) {
      video.currentTime = i * interval;
      await new Promise<void>(resolve => { video.onseeked = () => resolve(); });
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/jpeg', 0.95);
      });
      frames.push(new File([blob], `frame_${i}.jpg`, { type: 'image/jpeg' }));
    }

    URL.revokeObjectURL(video.src);
    return frames;
  };

  const handleVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      setVideo(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!video) return;

    try {
      setIsProcessing(true);
      setErrorMessage(null);

      const frames = await extractFrames(video);
      const formData = new FormData();
      frames.forEach((frame) => {
        formData.append('images', frame);
      });

      const response = await fetch('http://104.171.203.98:8000/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Processing failed');

      const data = await response.json();
      setModelUrl(`http://104.171.203.98:8000${data.model_url}`);

    } catch (error) {
      console.error('Error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8 text-gray-700">
        Hi! This is a demo of the 3D modeling tech I&apos;m working on.
        You can upload a video of your home interior or exterior. Max zoom recommended.
        It can do full exterior or interior that isn&apos;t too tight. Hallways are mean.
        I&apos;m using a sparse view construction model called Mast3r and tweaking it to get a whole house modeled.
        This demo is more optimized for speed than full reconstruction. Wait about 3 minutes for it to process.
      </div>
      
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoSelect}
            className="hidden"
            id="video-upload"
          />
          <label
            htmlFor="video-upload"
            className="cursor-pointer flex flex-col items-center space-y-2"
          >
            <div className="text-4xl">🎥</div>
            <span className="text-gray-600">
              {video ? video.name : 'Click to upload video'}
            </span>
          </label>
        </div>

        {video && (
          <button
            onClick={handleUpload}
            disabled={isProcessing}
            className="w-full bg-pink text-white p-3 rounded-lg disabled:bg-gray-300"
          >
            {isProcessing ? 'Processing...' : 'Process Video'}
          </button>
        )}

        {errorMessage && (
          <div className="text-red-500 text-center p-2">
            {errorMessage}
          </div>
        )}

        {modelUrl && (
        <div className="aspect-square w-full h-[80vh] border rounded-lg overflow-hidden">
          <model-viewer
            src={modelUrl}
            auto-rotate
            camera-controls
            exposure="0.75"
            shadow-intensity="1"
            camera-orbit="0deg 75deg 100%"
            min-camera-orbit="auto auto 50%"
            max-camera-orbit="auto auto 200%"
            camera-target="0m 0m 0m"
            field-of-view="45deg"
            scale="1 1 1"
            ar={false}
            ar-status="not-presenting"
            className="w-full h-full"
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#000000',
              '--poster-color': '#000000'
            }}
          />
        </div>
        )}
        
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}