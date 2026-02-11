'use client';

import { Video as SWVideo } from '@signalwire/js';
import { Mic, MicOff, Phone, PhoneOff, Video as VideoIcon } from 'lucide-react';
import firebase from '@/lib/firebase';
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref as storageRef, uploadBytes } from 'firebase/storage';
import React, { useEffect, useMemo, useRef, useState } from 'react';

type CallPhase = 'idle' | 'calling' | 'videoInviteSent' | 'ended';

interface ConferenceData {
  id: string;
  name: string;
}

interface RoomTokenResponse {
  token: string;
}

const FIXED_HOMEOWNER_NUMBER = '+16784471565';
const FIXED_PAINTER_CALLER_ID = '+16158096429';
const MOBILE_FRAME_WIDTH = 390;
const MOBILE_FRAME_HEIGHT = 844;

const PainterCallCenter: React.FC = () => {
  const [status, setStatus] = useState('Ready');
  const [phase, setPhase] = useState<CallPhase>('idle');
  const [conference, setConference] = useState<ConferenceData | null>(null);
  const [guestLink, setGuestLink] = useState('');
  const [isMuted, setMuted] = useState(false);
  const [hasVideoFrame, setHasVideoFrame] = useState(false);
  const [isStartingCall, setIsStartingCall] = useState(false);
  const [isSendingVideoInvite, setIsSendingVideoInvite] = useState(false);
  const [isCheckingAuth, setCheckingAuth] = useState(true);
  const [isPainterUser, setPainterUser] = useState(false);
  const [painterDocId, setPainterDocId] = useState<string | null>(null);
  const [authUid, setAuthUid] = useState<string | null>(null);

  const roomRef = useRef<HTMLDivElement>(null);
  const roomSessionRef = useRef<any>(null);
  const signalWireRecordingRef = useRef<any>(null);
  const signalWireRecordingIdRef = useRef<string | null>(null);
  const painterTokenRef = useRef('');
  const estimateInviteSentRef = useRef(false);
  const recordingStartedRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const activeCallRef = useRef(false);
  const findVideoTimerRef = useRef<number | null>(null);

  const auth = getAuth(firebase);
  const firestore = getFirestore(firebase);
  const storage = getStorage(firebase);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAuthUid(null);
        setPainterDocId(null);
        setPainterUser(false);
        setCheckingAuth(false);
        return;
      }

      setAuthUid(user.uid);
      const paintersQuery = query(
        collection(firestore, 'painters'),
        where('userId', '==', user.uid)
      );
      const snapshot = await getDocs(paintersQuery);
      if (!snapshot.empty) {
        setPainterDocId(snapshot.docs[0].id);
        setPainterUser(true);
      } else {
        setPainterDocId(null);
        setPainterUser(false);
      }
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [auth, firestore]);

  useEffect(() => {
    return () => {
      if (findVideoTimerRef.current) {
        window.clearInterval(findVideoTimerRef.current);
      }
    };
  }, []);

  const getJsonOrThrow = async (response: Response, fallbackMessage: string) => {
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = [payload.error, payload.likelyCause, payload.details].filter(Boolean).join(' | ');
      throw new Error(detail || fallbackMessage);
    }
    return payload;
  };

  const requestMicPermission = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Browser does not support microphone access');
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    stream.getTracks().forEach((track) => track.stop());
  };

  const createRoomToken = async (roomName: string, userName: string, permissions?: string[]) => {
    const response = await fetch('/api/signalwire/room-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        room_name: roomName,
        user_name: userName,
        permissions
      })
    });
    return getJsonOrThrow(response, 'Failed to create room token') as Promise<RoomTokenResponse>;
  };

  const waitForVideoContainer = async (timeoutMs = 4000) => {
    const start = Date.now();
    while (!roomRef.current) {
      if (Date.now() - start > timeoutMs) {
        throw new Error('Video container not ready');
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    return roomRef.current;
  };

  const joinPainterRoomAudioOnly = async (token: string) => {
    await waitForVideoContainer();

    if (roomSessionRef.current) {
      await roomSessionRef.current.leave();
      roomSessionRef.current = null;
    }

    const session = new SWVideo.RoomSession({
      token,
      rootElement: roomRef.current
    });
    await session.join({ audio: true, video: false });
    roomSessionRef.current = session;
    setMuted(false);
  };

  const findPlayableVideoElement = () => {
    const container = roomRef.current;
    if (!container) return null;
    const videos = Array.from(container.querySelectorAll('video')) as HTMLVideoElement[];
    return (
      videos.find((video) => video.readyState >= 2 && video.videoWidth > 0) ||
      null
    );
  };

  const startEstimateRecording = () => {
    if (recordingStartedRef.current || mediaRecorderRef.current) return;
    if (!activeCallRef.current || !estimateInviteSentRef.current) return;

    const videoEl = findPlayableVideoElement();
    if (!videoEl) return;
    setHasVideoFrame(true);

    if (roomSessionRef.current && !signalWireRecordingRef.current) {
      roomSessionRef.current
        .startRecording()
        .then((recording: any) => {
          signalWireRecordingRef.current = recording;
          signalWireRecordingIdRef.current = recording?.id || null;
          setStatus('Homeowner video detected. Recording estimate...');
        })
        .catch((error: unknown) => {
          console.error('SignalWire recording start error:', error);
        });
    }

    const captureStream =
      (videoEl as HTMLVideoElement & {
        captureStream?: () => MediaStream;
        webkitCaptureStream?: () => MediaStream;
      }).captureStream?.() ||
      (videoEl as HTMLVideoElement & {
        captureStream?: () => MediaStream;
        webkitCaptureStream?: () => MediaStream;
      }).webkitCaptureStream?.();
    if (!captureStream) return;

    const hasVideo = captureStream.getVideoTracks().length > 0;
    if (!hasVideo) return;

    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(captureStream, {
        mimeType: 'video/webm;codecs=vp8,opus'
      });
    } catch {
      recorder = new MediaRecorder(captureStream);
    }

    recordedChunksRef.current = [];
    recorder.ondataavailable = (event: BlobEvent) => {
      if (event.data && event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };
    recorder.start(1000);

    mediaRecorderRef.current = recorder;
    recordingStartedRef.current = true;
    setStatus('Homeowner video detected. Recording estimate...');

    if (findVideoTimerRef.current) {
      window.clearInterval(findVideoTimerRef.current);
      findVideoTimerRef.current = null;
    }
  };

  const startWatchingForHomeownerVideo = () => {
    if (findVideoTimerRef.current) {
      window.clearInterval(findVideoTimerRef.current);
    }

    findVideoTimerRef.current = window.setInterval(() => {
      if (!activeCallRef.current || !estimateInviteSentRef.current) {
        return;
      }
      startEstimateRecording();
    }, 1000);
  };

  const persistEstimateRecording = async () => {
    if (!estimateInviteSentRef.current || !recordingStartedRef.current) {
      return;
    }
    if (!painterDocId) return;

    const userImageRef = await addDoc(collection(firestore, 'userImages'), {
      address: 'Video Estimate',
      prices: [],
      phoneNumber: FIXED_HOMEOWNER_NUMBER,
      userId: authUid || undefined,
      title: `Estimate ${new Date().toLocaleString()}`,
      signalwireConferenceId: conference?.id || null,
      signalwireRecordingId: signalWireRecordingIdRef.current,
      createdAt: serverTimestamp()
    });

    let primaryVideo = '';
    const recordingId = signalWireRecordingIdRef.current;
    if (recordingId) {
      try {
        const recordingResponse = await fetch(`/api/signalwire/room-recording?recordingId=${encodeURIComponent(recordingId)}&waitMs=30000`);
        const recordingPayload = await getJsonOrThrow(
          recordingResponse,
          'Failed to fetch SignalWire recording asset'
        );
        if (recordingPayload?.recordingUrl) {
          primaryVideo = recordingPayload.recordingUrl;
        }
      } catch (error) {
        console.error('SignalWire recording retrieval failed, falling back to local capture:', error);
      }
    }

    // Fallback to browser capture only if SignalWire asset is not yet available.
    if (!primaryVideo) {
      const recorder = mediaRecorderRef.current;
      if (recorder) {
        const stopPromise = new Promise<void>((resolve) => {
          recorder.onstop = async () => {
            if (!recordedChunksRef.current.length) {
              resolve();
              return;
            }

            const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
            if (!blob.size) {
              resolve();
              return;
            }

            const storagePath = `consult-recordings/${painterDocId}/${userImageRef.id}.webm`;
            const fileRef = storageRef(storage, storagePath);
            await uploadBytes(fileRef, blob, { contentType: 'video/webm' });
            primaryVideo = storagePath;
            resolve();
          };
        });

        if (recorder.state !== 'inactive') {
          recorder.stop();
        }
        mediaRecorderRef.current = null;
        await stopPromise;
      }
    }

    if (primaryVideo) {
      await updateDoc(doc(firestore, 'userImages', userImageRef.id), {
        video: primaryVideo
      });
    }

    await updateDoc(doc(firestore, 'painters', painterDocId), {
      acceptedQuotes: arrayUnion(userImageRef.id)
    });

    if (primaryVideo.startsWith('http')) {
      setStatus('Call ended. SignalWire recording saved to painter dashboard.');
    } else if (primaryVideo) {
      setStatus('Call ended. Estimate video saved from local fallback.');
    } else {
      setStatus('Call ended, but recording asset is still processing.');
    }
  };

  const startPhoneCall = async () => {
    if (!isPainterUser || !painterDocId) {
      setStatus('Only signed-in painter accounts can start this call flow.');
      return;
    }

    setIsStartingCall(true);
    try {
      setStatus('Requesting microphone permission...');
      await requestMicPermission();

      setStatus('Creating call room...');
      const createResponse = await fetch('/api/signalwire/create-conference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `quote-call-${Date.now()}`,
          display_name: 'Quote Call with Homeowner'
        })
      });
      const confData = (await getJsonOrThrow(createResponse, 'Failed to create conference')) as ConferenceData;
      setConference(confData);
      setHasVideoFrame(false);
      setPhase('calling');

      const painterToken = await createRoomToken(confData.name, 'Painter', [
        'room.recording',
        'room.self.audio_mute',
        'room.self.audio_unmute'
      ]);
      painterTokenRef.current = painterToken.token;
      await joinPainterRoomAudioOnly(painterToken.token);

      const guestToken = await createRoomToken(confData.name, 'Homeowner');
      const appBase = process.env.NEXT_PUBLIC_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
      setGuestLink(`${appBase}/consult?token=${encodeURIComponent(guestToken.token)}`);

      setStatus('Dialing homeowner...');
      const dialResponse = await fetch('/api/signalwire/dial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conference_id: confData.id,
          room_name: confData.name,
          to: FIXED_HOMEOWNER_NUMBER,
          from: FIXED_PAINTER_CALLER_ID
        })
      });
      await getJsonOrThrow(dialResponse, 'Failed to dial homeowner');

      activeCallRef.current = true;
      estimateInviteSentRef.current = false;
      recordingStartedRef.current = false;
      setPhase('calling');
      setStatus('Phone call connected (audio-only).');
    } catch (error) {
      console.error(error);
      setStatus(`Error: ${(error as Error).message}`);
    } finally {
      setIsStartingCall(false);
    }
  };

  const toggleMute = async () => {
    const session = roomSessionRef.current;
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
      console.error('Mute toggle error:', error);
    }
  };

  const sendVideoEstimate = async () => {
    if (!guestLink) {
      setStatus('No consult link available yet.');
      return;
    }

    setIsSendingVideoInvite(true);
    try {
      const smsResponse = await fetch('/api/signalwire/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: FIXED_HOMEOWNER_NUMBER,
          body: `Join your video estimate: ${guestLink}`
        })
      });
      await getJsonOrThrow(smsResponse, 'Failed to send consult link');

      estimateInviteSentRef.current = true;
      setPhase('videoInviteSent');
      setStatus('Consult link sent. Waiting for homeowner video...');
      startWatchingForHomeownerVideo();
    } catch (error) {
      console.error('Send video estimate error:', error);
      setStatus(`Error: ${(error as Error).message}`);
    } finally {
      setIsSendingVideoInvite(false);
    }
  };

  const endCall = async () => {
    activeCallRef.current = false;
    if (findVideoTimerRef.current) {
      window.clearInterval(findVideoTimerRef.current);
      findVideoTimerRef.current = null;
    }

    try {
      if (signalWireRecordingRef.current) {
        try {
          await signalWireRecordingRef.current.stop();
        } catch (error) {
          console.error('SignalWire recording stop error:', error);
        }
        signalWireRecordingRef.current = null;
      }

      await persistEstimateRecording();

      if (roomSessionRef.current) {
        await roomSessionRef.current.leave();
        roomSessionRef.current = null;
      }
    } catch (error) {
      console.error('End call error:', error);
    }

    setPhase('ended');
    setConference(null);
    setMuted(false);
    setHasVideoFrame(false);
    setGuestLink('');
    painterTokenRef.current = '';
    estimateInviteSentRef.current = false;
    recordingStartedRef.current = false;
    mediaRecorderRef.current = null;
    recordedChunksRef.current = [];
    signalWireRecordingRef.current = null;
    signalWireRecordingIdRef.current = null;
    setStatus((prev) => prev.startsWith('Call ended') ? prev : 'Call ended.');
  };

  const stageLabel = useMemo(() => {
    if (phase === 'idle') return 'Ready';
    if (phase === 'calling') return 'On Call';
    if (phase === 'videoInviteSent') return 'Video Estimate';
    return 'Ended';
  }, [phase]);

  if (isCheckingAuth) {
    return <div style={{ padding: 24 }}>Checking account...</div>;
  }

  if (!isPainterUser) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle at 20% 0%, #ecf7ff 0%, #f8fafc 55%, #eef2f7 100%)',
          color: '#0f172a',
          padding: 24
        }}
      >
        <div
          style={{
            maxWidth: 540,
            width: '100%',
            background: '#fff',
            border: '1px solid #dbe3ef',
            borderRadius: 16,
            padding: 24,
            textAlign: 'center'
          }}
        >
          <h2 style={{ margin: '0 0 8px 0' }}>Painter Login Required</h2>
          <p style={{ margin: 0, color: '#475569' }}>
            This call screen is restricted to signed-in painter accounts.
          </p>
        </div>
      </div>
    );
  }

  const phoneFrameStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: MOBILE_FRAME_WIDTH,
    height: `min(100dvh - 32px, ${MOBILE_FRAME_HEIGHT}px)`,
    margin: '16px auto',
    borderRadius: 22,
    overflow: 'hidden',
    border: '1px solid #20242b',
    background: '#000',
    position: 'relative',
    boxShadow: '0 20px 40px rgba(0,0,0,0.35)'
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'radial-gradient(circle at 15% 0%, #edf7ff 0%, #f5f7fb 55%, #eef2f8 100%)', color: '#fff', padding: '8px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', margin: '8px 0 12px 0' }}>
          <div style={{ fontSize: 12, color: '#92a0b5', letterSpacing: 1 }}>{stageLabel}</div>
          <div style={{ marginTop: 6, fontWeight: 600 }}>{status}</div>
        </div>

        {phase === 'idle' && (
          <div style={{ maxWidth: 440, margin: '0 auto', background: '#171a20', border: '1px solid #2a2f36', borderRadius: 14, padding: 16 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#b6c2d4', marginBottom: 8 }}>Number to call</label>
            <input
              value={FIXED_HOMEOWNER_NUMBER}
              disabled
              style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #3a404a', background: '#0f1217', color: '#fff' }}
            />
            <button
              onClick={startPhoneCall}
              disabled={isStartingCall}
              style={{
                width: '100%',
                marginTop: 14,
                padding: 14,
                border: 'none',
                borderRadius: 999,
                background: isStartingCall ? '#4d7a5d' : '#2cb35f',
                color: '#fff',
                fontWeight: 700,
                cursor: isStartingCall ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <Phone size={18} />
              Call
            </button>
          </div>
        )}

        {(phase === 'calling' || phase === 'videoInviteSent') && (
          <div style={phoneFrameStyle}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#c6ced9',
                background: '#000',
                textAlign: 'center',
                padding: 18
              }}
            >
              {phase === 'calling'
                ? 'Audio call in progress. Send video estimate when ready.'
                : 'Waiting for homeowner video...'}
            </div>
            <div
              ref={roomRef}
              style={{
                position: 'absolute',
                inset: 0
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
                  color: '#8ea0bb',
                  textAlign: 'center',
                  padding: 16
                }}
              >
                {phase === 'calling' ? 'Audio call active' : 'Waiting for homeowner video...'}
              </div>
            )}

            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                padding: '10px 12px 14px',
                background: 'linear-gradient(to top, rgba(8,10,13,0.92), rgba(8,10,13,0.35), rgba(8,10,13,0))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10
              }}
            >
              <button
                onClick={toggleMute}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  border: 'none',
                  background: isMuted ? '#0f1116' : '#fff',
                  color: isMuted ? '#fff' : '#111',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              {phase === 'calling' && (
                <button
                  onClick={sendVideoEstimate}
                  disabled={isSendingVideoInvite}
                  style={{
                    height: 48,
                    borderRadius: 999,
                    border: 'none',
                    padding: '0 18px',
                    background: '#4f87ff',
                    color: '#fff',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  <VideoIcon size={16} />
                  Send Video Estimate
                </button>
              )}
              <button
                onClick={endCall}
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: '50%',
                  border: 'none',
                  background: '#e53935',
                  color: '#fff',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-label="End call"
              >
                <PhoneOff size={22} />
              </button>
            </div>
          </div>
        )}

        {phase === 'ended' && (
          <div style={phoneFrameStyle}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#7f8ba0'
              }}
            >
              Call ended
            </div>
          </div>
        )}

        {phase === 'videoInviteSent' && !!guestLink && (
          <div style={{ maxWidth: 560, margin: '6px auto 0', color: '#8ea0bb', fontSize: 12, textAlign: 'center', wordBreak: 'break-all' }}>
            Consult link: {guestLink}
          </div>
        )}
      </div>
    </div>
  );
};

export default PainterCallCenter;
