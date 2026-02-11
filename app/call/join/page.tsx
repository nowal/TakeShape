'use client';

import { Video } from '@signalwire/js';
import React, { useEffect, useRef, useState } from 'react';

const CallJoinPage: React.FC = () => {
  const roomRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<any>(null);
  const [status, setStatus] = useState('Preparing...');

  useEffect(() => {
    let mounted = true;

    const start = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (!token) {
          setStatus('Missing join token');
          return;
        }

        if (!roomRef.current) {
          setStatus('Video container not ready');
          return;
        }

        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('This browser does not support camera/microphone access');
        }
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        stream.getTracks().forEach((track) => track.stop());

        setStatus('Joining call...');
        const session = new Video.RoomSession({
          token,
          rootElement: roomRef.current
        });

        await session.join();
        sessionRef.current = session;
        if (mounted) {
          setStatus('Connected');
        }
      } catch (error) {
        console.error('Join room error:', error);
        if (mounted) {
          setStatus(`Failed to join: ${(error as Error).message}`);
        }
      }
    };

    start();

    return () => {
      mounted = false;
      if (sessionRef.current) {
        sessionRef.current.leave().catch(() => undefined);
        sessionRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#101214', color: '#fff', padding: '16px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <h1 style={{ margin: '0 0 8px 0' }}>Video Estimate Call</h1>
        <p style={{ margin: '0 0 16px 0', color: '#b8c0cc' }}>{status}</p>
        <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #2a2f36', background: '#000' }}>
          <div ref={roomRef} style={{ width: '100%', height: '75vh', minHeight: '480px' }} />
        </div>
      </div>
    </div>
  );
};

export default CallJoinPage;
