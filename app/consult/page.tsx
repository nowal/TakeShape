'use client';

import { Video as SWVideo } from '@signalwire/js';
import { Mic, MicOff, PhoneOff, RotateCcw, Video, VideoOff } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

const MOBILE_FRAME_WIDTH = 390;
const MOBILE_FRAME_HEIGHT = 844;

const ConsultPage: React.FC = () => {
  const roomRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<any>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const tokenRef = useRef<string>('');

  const [status, setStatus] = useState('Preparing...');
  const [isMuted, setMuted] = useState(false);
  const [isVideoOff, setVideoOff] = useState(false);
  const [isEnded, setEnded] = useState(false);
  const [isRejoining, setRejoining] = useState(false);
  const [hasVideoFrame, setHasVideoFrame] = useState(false);

  const cleanupSession = useCallback(async () => {
    if (sessionRef.current) {
      try {
        await sessionRef.current.leave();
      } catch {
        // no-op
      }
      sessionRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
  }, []);

  const joinConsult = useCallback(async (token: string) => {
    if (!roomRef.current) {
      throw new Error('Video container not ready');
    }

    await cleanupSession();

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: {
        facingMode: { ideal: 'environment' }
      }
    });
    localStreamRef.current = stream;

    const session = new SWVideo.RoomSession({
      token,
      rootElement: roomRef.current,
      localStream: stream
    });
    await session.join({ audio: true, video: true });
    sessionRef.current = session;
  }, [cleanupSession]);

  useEffect(() => {
    let mounted = true;

    const start = async () => {
      try {
        const token = new URLSearchParams(window.location.search).get('token');
        if (!token) {
          setStatus('Missing token');
          return;
        }
        tokenRef.current = token;

        setStatus('Requesting camera and microphone...');
        await joinConsult(token);
        if (mounted) {
          setStatus('Connected');
          setEnded(false);
          setMuted(false);
          setVideoOff(false);
          setHasVideoFrame(false);
        }
      } catch (error) {
        console.error('Consult join error:', error);
        if (mounted) {
          setStatus(`Failed to join: ${(error as Error).message}`);
          setEnded(true);
        }
      }
    };

    start();

    const handleOffline = () => {
      setStatus('Connection lost. Reconnect when network returns.');
    };

    window.addEventListener('offline', handleOffline);

    return () => {
      mounted = false;
      window.removeEventListener('offline', handleOffline);
      cleanupSession();
    };
  }, [cleanupSession, joinConsult]);

  useEffect(() => {
    if (isEnded) return;
    const timer = window.setInterval(() => {
      const container = roomRef.current;
      if (!container) return;
      const videos = Array.from(container.querySelectorAll('video')) as HTMLVideoElement[];
      const hasReadyVideo = videos.some((video) => video.readyState >= 2 && video.videoWidth > 0);
      if (hasReadyVideo) {
        setHasVideoFrame(true);
        window.clearInterval(timer);
      }
    }, 500);
    return () => window.clearInterval(timer);
  }, [isEnded, status]);

  const toggleMute = async () => {
    const session = sessionRef.current;
    if (!session) return;
    try {
      if (isMuted) {
        await session.audioUnmute();
        setMuted(false);
      } else {
        await session.audioMute();
        setMuted(true);
      }
    } catch (error) {
      console.error('Mute error:', error);
    }
  };

  const toggleVideo = async () => {
    const session = sessionRef.current;
    if (!session) return;
    try {
      if (isVideoOff) {
        await session.restoreOutboundVideo();
        setVideoOff(false);
      } else {
        await session.stopOutboundVideo();
        setVideoOff(true);
      }
    } catch (error) {
      console.error('Video toggle error:', error);
    }
  };

  const endCall = async () => {
    await cleanupSession();
    setEnded(true);
    setHasVideoFrame(false);
    setStatus('Call ended.');
  };

  const rejoin = async () => {
    if (!tokenRef.current) return;
    setRejoining(true);
    try {
      setStatus('Rejoining consult...');
      await joinConsult(tokenRef.current);
      setEnded(false);
      setHasVideoFrame(false);
      setStatus('Connected');
    } catch (error) {
      console.error('Rejoin error:', error);
      setStatus(`Rejoin failed: ${(error as Error).message}`);
    } finally {
      setRejoining(false);
    }
  };

  const frameStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: MOBILE_FRAME_WIDTH,
    height: `min(100dvh - 20px, ${MOBILE_FRAME_HEIGHT}px)`,
    margin: '10px auto',
    borderRadius: 22,
    overflow: 'hidden',
    border: '1px solid #21252d',
    background: '#000',
    position: 'relative',
    boxShadow: '0 22px 45px rgba(0,0,0,0.42)'
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'radial-gradient(circle at 10% 0%, #eaf5ff 0%, #f4f7fb 58%, #eaf0f8 100%)', color: '#fff', padding: '4px' }}>
      <div style={frameStyle}>
        {isEnded ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: '#000',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8c98ad',
              gap: 14
            }}
          >
            <div>Call ended</div>
            {!!tokenRef.current && (
              <button
                onClick={rejoin}
                disabled={isRejoining}
                style={{
                  border: '1px solid #334155',
                  background: '#111827',
                  color: '#fff',
                  borderRadius: 999,
                  padding: '10px 16px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <RotateCcw size={14} />
                {isRejoining ? 'Rejoining...' : 'Rejoin'}
              </button>
            )}
          </div>
        ) : (
          <>
            <div ref={roomRef} style={{ position: 'absolute', inset: 0 }} />
            {!hasVideoFrame && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#8c98ad'
                }}
              >
                Waiting for video...
              </div>
            )}
            <div
              style={{
                position: 'absolute',
                top: 10,
                left: 0,
                right: 0,
                textAlign: 'center',
                fontSize: 12,
                color: '#d2d7df',
                textShadow: '0 1px 2px rgba(0,0,0,0.8)'
              }}
            >
              {status}
            </div>
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                padding: '10px 12px 14px',
                background: 'linear-gradient(to top, rgba(8,10,13,0.95), rgba(8,10,13,0.35), rgba(8,10,13,0))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10
              }}
            >
              <button
                onClick={toggleMute}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  border: 'none',
                  background: isMuted ? '#0f1116' : '#fff',
                  color: isMuted ? '#fff' : '#111',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <button
                onClick={toggleVideo}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  border: 'none',
                  background: isVideoOff ? '#0f1116' : '#fff',
                  color: isVideoOff ? '#fff' : '#111',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-label={isVideoOff ? 'Turn video on' : 'Turn video off'}
              >
                {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
              </button>
              <button
                onClick={endCall}
                style={{
                  width: 62,
                  height: 62,
                  borderRadius: '50%',
                  border: 'none',
                  background: '#e53935',
                  color: '#fff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-label="End call"
              >
                <PhoneOff size={22} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ConsultPage;
