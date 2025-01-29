// app/page.tsx
'use client';

import FeatureTracker from './FeatureTracker';

export default function Home() {
  const handleStartRecording = () => {
    console.log('Started recording');
  };

  const handleStopRecording = () => {
    console.log('Stopped recording');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4">
      <div className="w-full max-w-4xl h-[80vh]">
        <FeatureTracker
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
        />
      </div>
    </main>
  );
}