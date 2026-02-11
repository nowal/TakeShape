'use client';

import { Video as SWVideo } from '@signalwire/js';
import { Mic, MicOff, PhoneOff, RotateCcw, Video, VideoOff } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

const MOBILE_FRAME_WIDTH = 390;
const MOBILE_FRAME_HEIGHT = 844;

const pickLikelyBackCamera = (devices: MediaDeviceInfo[]) => {
  const videoInputs = devices.filter((device) => device.kind === 'videoinput');
  if (!videoInputs.length) return null;
  const prioritized = videoInputs.find((device) =>
    /back|rear|environment|world/i.test(device.label)
  );
  return prioritized || null;
};

const isEnvironmentFacingTrack = (track: MediaStreamTrack | undefined) => {
  if (!track) return false;
  const settings = track.getSettings?.();
  return String(settings?.facingMode || '').toLowerCase() === 'environment';
};

const ConsultPage: React.FC = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const sessionRef = useRef<any>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const tokenRef = useRef<string>('');
  const [debugEnabled, setDebugEnabled] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const [status, setStatus] = useState('Preparing...');
  const [isMuted, setMuted] = useState(false);
  const [isVideoOff, setVideoOff] = useState(false);
  const [isEnded, setEnded] = useState(false);
  const [isRejoining, setRejoining] = useState(false);
  const [hasVideoFrame, setHasVideoFrame] = useState(false);

  const pushDebugLog = useCallback((message: string) => {
    if (!debugEnabled) return;
    const stamp = new Date().toISOString().slice(11, 23);
    setDebugLogs((prev) => [...prev.slice(-13), `${stamp} ${message}`]);
    console.log(`[consult-debug] ${message}`);
  }, [debugEnabled]);

  const cleanupSession = useCallback(async () => {
    pushDebugLog('cleanupSession()');
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
  }, [pushDebugLog]);

  const getBackCameraStream = useCallback(async (): Promise<MediaStream> => {
    pushDebugLog('Requesting initial stream with facingMode=environment (ideal)');
    const initialStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: { facingMode: { ideal: 'environment' } }
    });
    const initialVideoTrack = initialStream.getVideoTracks()[0];
    pushDebugLog(`Initial video settings: ${JSON.stringify(initialVideoTrack?.getSettings?.() || {})}`);
    if (isEnvironmentFacingTrack(initialVideoTrack)) {
      pushDebugLog('Initial stream already environment-facing');
      return initialStream;
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoInputs = devices.filter((device) => device.kind === 'videoinput');
    const currentDeviceId = initialVideoTrack?.getSettings()?.deviceId;
    const prioritizedBack = pickLikelyBackCamera(devices);
    pushDebugLog(`Camera candidates found: ${videoInputs.length}; prioritized back: ${prioritizedBack?.label || 'none'}`);

    const candidates = [
      ...(prioritizedBack ? [prioritizedBack] : []),
      ...videoInputs.filter((device) => {
        if (prioritizedBack && device.deviceId === prioritizedBack.deviceId) return false;
        if (currentDeviceId && device.deviceId === currentDeviceId) return false;
        return !/front|user|facetime/i.test(device.label);
      })
    ];

    for (const candidate of candidates) {
      try {
        pushDebugLog(`Trying candidate camera: ${candidate.label || candidate.deviceId}`);
        const switchedStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: { deviceId: { exact: candidate.deviceId } }
        });
        const switchedTrack = switchedStream.getVideoTracks()[0];
        const appearsBackCamera =
          isEnvironmentFacingTrack(switchedTrack) ||
          /back|rear|environment|world/i.test(candidate.label);
        if (appearsBackCamera) {
          pushDebugLog(`Switched to back camera: ${candidate.label || candidate.deviceId}`);
          initialStream.getTracks().forEach((track) => track.stop());
          return switchedStream;
        }
        switchedStream.getTracks().forEach((track) => track.stop());
      } catch {
        pushDebugLog(`Candidate failed: ${candidate.label || candidate.deviceId}`);
        // try next candidate
      }
    }

    pushDebugLog('Falling back to initial stream');
    return initialStream;
  }, [pushDebugLog]);

  const createTokenForRoom = async (roomName: string) => {
    const response = await fetch('/api/signalwire/room-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        room_name: roomName,
        user_name: `Homeowner-${Date.now()}`,
        join_audio_muted: false,
        join_video_muted: false
      })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.token) {
      const detail = [payload.error, payload.details].filter(Boolean).join(' | ');
      throw new Error(detail || 'Failed to generate consult token');
    }
    return payload.token as string;
  };

  const waitForLocalVideoFrame = async (videoEl: HTMLVideoElement, timeoutMs = 6000) => {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (videoEl.readyState >= 2 && videoEl.videoWidth > 0) return true;
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
    return false;
  };

  const attachLocalStreamPreview = async (stream: MediaStream) => {
    const videoEl = localVideoRef.current;
    if (!videoEl) return false;
    pushDebugLog(`attachLocalStreamPreview(): track settings ${JSON.stringify(stream.getVideoTracks()[0]?.getSettings?.() || {})}`);
    videoEl.srcObject = stream;
    try {
      await videoEl.play();
    } catch {
      // iOS/Safari may still resolve playback after metadata is loaded.
    }
    return waitForLocalVideoFrame(videoEl);
  };

  const joinConsult = useCallback(async (token: string) => {
    await cleanupSession();
    setHasVideoFrame(false);
    pushDebugLog('joinConsult(): begin');

    const stream = await getBackCameraStream();
    localStreamRef.current = stream;
    stream.getVideoTracks().forEach((track) => {
      track.enabled = true;
      pushDebugLog(`Local video track enabled=${track.enabled} muted=${track.muted} readyState=${track.readyState}`);
      track.onended = () => pushDebugLog('Local video track ended');
      track.onmute = () => pushDebugLog('Local video track muted');
      track.onunmute = () => pushDebugLog('Local video track unmuted');
    });
    const previewReady = await attachLocalStreamPreview(stream);
    pushDebugLog(`Local preview ready=${previewReady}`);

    const session = new SWVideo.RoomSession({
      token,
      localStream: stream
    });
    await session.join({
      sendAudio: true,
      sendVideo: true,
      receiveAudio: true,
      receiveVideo: true
    });
    pushDebugLog('Room joined with sendVideo=true');
    try {
      await session.videoUnmute?.();
      pushDebugLog('session.videoUnmute() called');
    } catch {
      // no-op
    }
    try {
      await session.restoreOutboundVideo?.();
      pushDebugLog('session.restoreOutboundVideo() called');
    } catch {
      // no-op
    }
    sessionRef.current = session;
    setHasVideoFrame(Boolean(previewReady));
  }, [cleanupSession, getBackCameraStream, pushDebugLog]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setDebugEnabled(params.get('debug') === '1');
  }, []);

  useEffect(() => {
    let mounted = true;

    const start = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        let token = params.get('token');
        if (!token) {
          const roomName = params.get('room');
          if (!roomName) {
            setStatus('Missing token');
            return;
          }
          setStatus('Preparing secure room access...');
          token = await createTokenForRoom(roomName);
        }
        if (!token) {
          setStatus('Missing token');
          return;
        }
        tokenRef.current = token;

        setStatus('Requesting camera and microphone...');
        await joinConsult(token);
        if (mounted) {
          setStatus('Connected');
          pushDebugLog('Status=Connected');
          setEnded(false);
          setMuted(false);
          setVideoOff(false);
        }
      } catch (error) {
        console.error('Consult join error:', error);
        pushDebugLog(`Join error: ${(error as Error).message}`);
        if (mounted) {
          setStatus(`Failed to join: ${(error as Error).message}`);
          setEnded(true);
        }
      }
    };

    start();

    const handleOffline = () => {
      pushDebugLog('Window offline event');
      setStatus('Connection lost. Reconnect when network returns.');
    };

    window.addEventListener('offline', handleOffline);

    return () => {
      mounted = false;
      window.removeEventListener('offline', handleOffline);
      cleanupSession();
    };
  }, [cleanupSession, joinConsult, pushDebugLog]);

  const toggleMute = async () => {
    const session = sessionRef.current;
    if (!session) return;
    try {
      if (isMuted) {
        await session.audioUnmute();
        pushDebugLog('audioUnmute()');
        setMuted(false);
      } else {
        await session.audioMute();
        pushDebugLog('audioMute()');
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
        pushDebugLog('restoreOutboundVideo() from button');
        setVideoOff(false);
      } else {
        await session.stopOutboundVideo();
        pushDebugLog('stopOutboundVideo() from button');
        setVideoOff(true);
      }
    } catch (error) {
      console.error('Video toggle error:', error);
    }
  };

  const endCall = async () => {
    await cleanupSession();
    pushDebugLog('Call ended by user');
    setEnded(true);
    setHasVideoFrame(false);
    setStatus('Call ended.');
  };

  const rejoin = async () => {
    if (!tokenRef.current) return;
    setRejoining(true);
    try {
      setStatus('Rejoining consult...');
      pushDebugLog('Rejoining consult');
      await joinConsult(tokenRef.current);
      setEnded(false);
      setStatus('Connected');
    } catch (error) {
      console.error('Rejoin error:', error);
      setStatus(`Rejoin failed: ${(error as Error).message}`);
      pushDebugLog(`Rejoin error: ${(error as Error).message}`);
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
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                background: '#000'
              }}
            />
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
            {debugEnabled && (
              <div
                style={{
                  position: 'absolute',
                  left: 10,
                  right: 10,
                  top: 34,
                  maxHeight: '35%',
                  overflowY: 'auto',
                  borderRadius: 8,
                  background: 'rgba(0,0,0,0.55)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  padding: '8px 10px',
                  fontSize: 10,
                  lineHeight: 1.3,
                  color: '#d1e0ff',
                  textAlign: 'left'
                }}
              >
                {debugLogs.length ? debugLogs.join('\n') : 'Debug log enabled...'}
              </div>
            )}
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
