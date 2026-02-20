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
import { normalizeUsPhoneToE164 } from '@/utils/phone';
import { PRIMARY_COLOR_HEX } from '@/constants/brand-color';

type CallPhase = 'idle' | 'calling' | 'videoInviteSent' | 'quoteDraft' | 'ended' | 'dropped';

interface ConferenceData {
  id: string;
  name: string;
}

interface RoomTokenResponse {
  token: string;
}

interface DialResponse {
  sid?: string;
  call_sid?: string;
  callSid?: string;
  [key: string]: unknown;
}

const isQuoteModePayload = (payload: any) => {
  const mode = String(payload?.mode || '').trim().toLowerCase();
  const meta = payload?.meta || {};
  const quoteFlagRaw =
    meta.quote_mode ??
    meta.quoteMode ??
    meta.quote_started ??
    meta.quoteStarted;
  const quoteStartedRaw =
    meta.quote_started_at ??
    meta.quoteStartedAt ??
    meta.quote_startedAt;
  const quoteFlag =
    quoteFlagRaw === true ||
    String(quoteFlagRaw || '').trim().toLowerCase() === 'true' ||
    String(quoteFlagRaw || '').trim() === '1';
  return mode === 'quote' || quoteFlag || Boolean(quoteStartedRaw);
};

const DEFAULT_HOMEOWNER_NUMBER = '+16784471565';
const MOBILE_FRAME_WIDTH = 390;
const MOBILE_FRAME_HEIGHT = 844;
const AUTH_CHECK_TIMEOUT_MS = 10000;

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
  const [homeownerNumberInput, setHomeownerNumberInput] = useState(DEFAULT_HOMEOWNER_NUMBER);
  const [painterCallerId, setPainterCallerId] = useState('');
  const [quoteItem, setQuoteItem] = useState('');
  const [quotePrice, setQuotePrice] = useState('');
  const [isSettingQuoteMode, setSettingQuoteMode] = useState(false);

  const remoteVideoRef = useRef<HTMLVideoElement>(null);
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
  const trackHandlerRef = useRef<((event: RTCTrackEvent) => void) | null>(null);
  const activeHomeownerNumberRef = useRef(DEFAULT_HOMEOWNER_NUMBER);
  const activeCallSidRef = useRef<string | null>(null);
  const localEndRequestedRef = useRef(false);
  const conferenceWatchTimerRef = useRef<number | null>(null);
  const activeConferenceIdRef = useRef<string | null>(null);
  const activeConferenceNameRef = useRef<string | null>(null);
  const callAnsweredRef = useRef(false);
  const remoteEndingRef = useRef(false);
  const memberJoinedHandlerRef = useRef<((payload: any) => void) | null>(null);
  const memberLeftHandlerRef = useRef<((payload: any) => void) | null>(null);

  const auth = getAuth(firebase);
  const firestore = getFirestore(firebase);
  const storage = getStorage(firebase);

  useEffect(() => {
    let isMounted = true;
    const authCheckTimeout = window.setTimeout(() => {
      if (!isMounted) return;
      console.warn(
        'Call page auth check timed out. Continuing as signed out.'
      );
      setAuthUid(null);
      setPainterDocId(null);
      setPainterUser(false);
      setPainterCallerId('');
      setCheckingAuth(false);
    }, AUTH_CHECK_TIMEOUT_MS);

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!isMounted) return;
        try {
          if (!user) {
            if (activeCallRef.current) {
              localEndRequestedRef.current = true;
              activeCallRef.current = false;
              stopConferenceWatch();
              await forceEndConference();
              if (roomSessionRef.current) {
                try {
                  await roomSessionRef.current.leave();
                } catch {
                  // no-op
                }
                roomSessionRef.current = null;
              }
              if (!isMounted) return;
              setPhase('dropped');
              setStatus('Session expired. Call ended.');
            }
            setAuthUid(null);
            setPainterDocId(null);
            setPainterUser(false);
            setPainterCallerId('');
            return;
          }

          setAuthUid(user.uid);
          const paintersQuery = query(
            collection(firestore, 'painters'),
            where('userId', '==', user.uid)
          );
          const snapshot = await getDocs(paintersQuery);
          if (!isMounted) return;

          if (!snapshot.empty) {
            const painterDoc = snapshot.docs[0];
            setPainterDocId(painterDoc.id);
            const painterData = painterDoc.data() as Record<
              string,
              unknown
            >;
            const normalizedPhone = normalizeUsPhoneToE164(
              String(
                painterData.phoneNumber ||
                  painterData.phoneNumberRaw ||
                  ''
              )
            );
            setPainterCallerId(normalizedPhone || '');
            setPainterUser(true);
          } else {
            setPainterDocId(null);
            setPainterUser(false);
            setPainterCallerId('');
          }
        } catch (error) {
          console.error('Call page auth check failed:', error);
          if (!isMounted) return;
          setAuthUid(null);
          setPainterDocId(null);
          setPainterUser(false);
          setPainterCallerId('');
        } finally {
          if (!isMounted) return;
          window.clearTimeout(authCheckTimeout);
          setCheckingAuth(false);
        }
      },
      (error) => {
        if (!isMounted) return;
        console.error('Call page auth listener failed:', error);
        window.clearTimeout(authCheckTimeout);
        setAuthUid(null);
        setPainterDocId(null);
        setPainterUser(false);
        setPainterCallerId('');
        setCheckingAuth(false);
      }
    );

    return () => {
      isMounted = false;
      window.clearTimeout(authCheckTimeout);
      unsubscribe();
    };
  }, [auth, firestore]);

  useEffect(() => {
    return () => {
      if (findVideoTimerRef.current) {
        window.clearInterval(findVideoTimerRef.current);
      }
      if (conferenceWatchTimerRef.current) {
        window.clearInterval(conferenceWatchTimerRef.current);
      }
      if (roomSessionRef.current) {
        if (trackHandlerRef.current && roomSessionRef.current.off) {
          roomSessionRef.current.off('track', trackHandlerRef.current);
        }
        if (memberJoinedHandlerRef.current && roomSessionRef.current.off) {
          roomSessionRef.current.off('member.joined', memberJoinedHandlerRef.current);
        }
        if (memberLeftHandlerRef.current && roomSessionRef.current.off) {
          roomSessionRef.current.off('member.left', memberLeftHandlerRef.current);
        }
        roomSessionRef.current.leave().catch(() => undefined);
        roomSessionRef.current = null;
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

  const stopConferenceWatch = () => {
    if (conferenceWatchTimerRef.current) {
      window.clearInterval(conferenceWatchTimerRef.current);
      conferenceWatchTimerRef.current = null;
    }
  };

  const forceEndConference = async () => {
    const conferenceId = activeConferenceIdRef.current || conference?.id || null;
    const roomName = activeConferenceNameRef.current || conference?.name || null;
    if (!conferenceId && !roomName) return;
    try {
      await fetch('/api/signalwire/end-conference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conferenceId: conferenceId || undefined,
          roomName: roomName || undefined,
          callSid: activeCallSidRef.current || undefined
        })
      });
    } catch (error) {
      console.error('Failed to end conference on server:', error);
    }
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

  const setRemoteVideoStream = (stream: MediaStream | null) => {
    const videoEl = remoteVideoRef.current;
    if (!videoEl) return;
    videoEl.srcObject = stream;
    if (stream) {
      videoEl
        .play()
        .then(() => undefined)
        .catch(() => undefined);
    }
  };

  const joinPainterRoomAudioOnly = async (token: string) => {
    if (roomSessionRef.current) {
      if (trackHandlerRef.current && roomSessionRef.current.off) {
        roomSessionRef.current.off('track', trackHandlerRef.current);
      }
      if (memberJoinedHandlerRef.current && roomSessionRef.current.off) {
        roomSessionRef.current.off('member.joined', memberJoinedHandlerRef.current);
      }
      if (memberLeftHandlerRef.current && roomSessionRef.current.off) {
        roomSessionRef.current.off('member.left', memberLeftHandlerRef.current);
      }
      await roomSessionRef.current.leave();
      roomSessionRef.current = null;
    }

    const session = new SWVideo.RoomSession({
      token
    });
    const trackHandler = (event: RTCTrackEvent) => {
      const track = event?.track;
      if (!track || track.kind !== 'video') return;
      const stream = event.streams?.[0] || new MediaStream([track]);
      setRemoteVideoStream(stream);
      setHasVideoFrame(true);
      startEstimateRecording();
    };
    session.on('track', trackHandler);
    trackHandlerRef.current = trackHandler;

    const memberJoinedHandler = (payload: any) => {
      const memberId = String(payload?.member?.id || '');
      if (!memberId) return;
      if (memberId === String((session as any)?.memberId || '')) return;
      callAnsweredRef.current = true;
      if (phase === 'calling' || phase === 'videoInviteSent') {
        setStatus(
          estimateInviteSentRef.current
            ? 'Homeowner video connected.'
            : 'Phone call connected (audio-only).'
        );
      }
    };
    session.on('member.joined', memberJoinedHandler);
    memberJoinedHandlerRef.current = memberJoinedHandler;

    const memberLeftHandler = async (payload: any) => {
      if (localEndRequestedRef.current) return;
      const memberId = String(payload?.member?.id || '');
      if (!memberId) return;
      if (memberId === String((session as any)?.memberId || '')) return;
      if (!activeCallRef.current) return;

      remoteEndingRef.current = true;
      activeCallRef.current = false;
      callAnsweredRef.current = false;
      stopConferenceWatch();
      if (findVideoTimerRef.current) {
        window.clearInterval(findVideoTimerRef.current);
        findVideoTimerRef.current = null;
      }

      try {
        await forceEndConference();
      } catch {
        // no-op
      }

      if (roomSessionRef.current) {
        if (trackHandlerRef.current && roomSessionRef.current.off) {
          roomSessionRef.current.off('track', trackHandlerRef.current);
        }
        if (memberJoinedHandlerRef.current && roomSessionRef.current.off) {
          roomSessionRef.current.off('member.joined', memberJoinedHandlerRef.current);
        }
        if (memberLeftHandlerRef.current && roomSessionRef.current.off) {
          roomSessionRef.current.off('member.left', memberLeftHandlerRef.current);
        }
        await roomSessionRef.current.leave().catch(() => undefined);
        roomSessionRef.current = null;
      }

      setPhase('ended');
      setStatus('Call ended by other participant.');
      setHasVideoFrame(false);
    };
    session.on('member.left', memberLeftHandler);
    memberLeftHandlerRef.current = memberLeftHandler;

    await session.join({
      sendAudio: true,
      sendVideo: false,
      receiveAudio: true,
      receiveVideo: true
    });
    roomSessionRef.current = session;
    setMuted(false);
  };

  const findPlayableVideoElement = () => {
    const video = remoteVideoRef.current;
    if (!video) return null;
    return video.readyState >= 2 && video.videoWidth > 0 ? video : null;
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

  const watchCallHealth = () => {
    stopConferenceWatch();
    conferenceWatchTimerRef.current = window.setInterval(async () => {
      if (!conference?.id || !activeCallRef.current) return;
      if (localEndRequestedRef.current) return;

      try {
        const conferenceStateResponse = await fetch(
          `/api/signalwire/conference-state?conferenceId=${encodeURIComponent(conference.id)}&_ts=${Date.now()}`,
          {
            cache: 'no-store',
            headers: {
              'cache-control': 'no-cache',
              pragma: 'no-cache'
            }
          }
        );
        const conferenceState = await conferenceStateResponse.json().catch(() => ({}));
        if (!conferenceStateResponse.ok) return;

        if (!conferenceState?.exists) {
          activeCallRef.current = false;
          stopConferenceWatch();
          if (roomSessionRef.current) {
            await roomSessionRef.current.leave().catch(() => undefined);
            roomSessionRef.current = null;
          }
          const shouldBeEnded = remoteEndingRef.current || callAnsweredRef.current;
          setPhase(shouldBeEnded ? 'ended' : 'dropped');
          setStatus(
            shouldBeEnded
              ? 'Call ended by other participant.'
              : 'It looks like your call dropped unexpectedly.'
          );
          return;
        }

        if (conferenceState?.mode === 'ending' && !localEndRequestedRef.current) {
          remoteEndingRef.current = true;
          activeCallRef.current = false;
          stopConferenceWatch();
          if (roomSessionRef.current) {
            await roomSessionRef.current.leave().catch(() => undefined);
            roomSessionRef.current = null;
          }
          setPhase('ended');
          setStatus('Call ended by other participant.');
          return;
        }

        if (isQuoteModePayload(conferenceState) && phase === 'videoInviteSent') {
          setPhase('quoteDraft');
          setStatus('Quote mode active. Audio call continues.');
          setHasVideoFrame(false);
        }

        const callSid = activeCallSidRef.current;
        if (callSid) {
          const callStatusResponse = await fetch(
            `/api/signalwire/call-status?callSid=${encodeURIComponent(callSid)}`
          );
          const callStatusPayload = await callStatusResponse.json().catch(() => ({}));
          if (callStatusResponse.ok && callStatusPayload?.completed) {
            activeCallRef.current = false;
            stopConferenceWatch();
            await forceEndConference();
            if (roomSessionRef.current) {
              await roomSessionRef.current.leave().catch(() => undefined);
              roomSessionRef.current = null;
            }
            setPhase('ended');
            setStatus('Call ended by other participant.');
          }
        }
      } catch (error) {
        console.error('Call health watcher error:', error);
      }
    }, 4000);
  };

  const waitForCallAnswer = async (callSid: string, timeoutMs = 45000) => {
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
      if (localEndRequestedRef.current) {
        return { answered: false as const, status: 'cancelled' };
      }
      if (callAnsweredRef.current) {
        return { answered: true as const, status: 'member_joined' };
      }
      const response = await fetch(`/api/signalwire/call-status?callSid=${encodeURIComponent(callSid)}`);
      const payload = await response.json().catch(() => ({}));

      if (response.ok) {
        const currentStatus = String(payload?.status || '').toLowerCase();
        if (currentStatus === 'in-progress' || currentStatus === 'in_progress' || currentStatus === 'answered') {
          return { answered: true as const, status: currentStatus };
        }
        if (payload?.completed) {
          return { answered: false as const, status: currentStatus || 'completed' };
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return { answered: false as const, status: 'timeout' };
  };

  const persistEstimateRecording = async () => {
    if (!estimateInviteSentRef.current || !recordingStartedRef.current) {
      return;
    }
    if (!painterDocId) return;

    const userImageRef = await addDoc(collection(firestore, 'userImages'), {
      address: 'Video Estimate',
      prices: [],
      phoneNumber: activeHomeownerNumberRef.current,
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
      const normalizedHomeowner = normalizeUsPhoneToE164(homeownerNumberInput);
      if (!normalizedHomeowner) {
        setStatus('Enter a valid US homeowner phone number.');
        return;
      }
      const normalizedPainterCallerId = normalizeUsPhoneToE164(painterCallerId);
      if (!normalizedPainterCallerId) {
        setStatus('Painter caller ID is missing or invalid. Re-register phone verification.');
        return;
      }

      setStatus('Requesting microphone permission...');
      await requestMicPermission();

      // Ensure stale sessions for this painter are cleaned up before creating a new call.
      await fetch('/api/signalwire/cleanup-painter-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          painterDocId
        })
      }).catch(() => undefined);

      setStatus('Creating call room...');
      const createResponse = await fetch('/api/signalwire/create-conference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `quote-call-${Date.now()}`,
          display_name: 'Quote Call with Homeowner',
          meta: {
            painter_doc_id: painterDocId,
            call_mode: 'live',
            started_at: new Date().toISOString()
          }
        })
      });
      const confData = (await getJsonOrThrow(createResponse, 'Failed to create conference')) as ConferenceData;
      setConference(confData);
      activeConferenceIdRef.current = confData.id;
      activeConferenceNameRef.current = confData.name;
      setHasVideoFrame(false);
      setPhase('calling');

      const painterToken = await createRoomToken(confData.name, 'Painter', [
        'room.recording',
        'room.self.audio_mute',
        'room.self.audio_unmute'
      ]);
      painterTokenRef.current = painterToken.token;
      await joinPainterRoomAudioOnly(painterToken.token);

      const appBase = process.env.NEXT_PUBLIC_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
      setGuestLink(`${appBase}/consult?room=${encodeURIComponent(confData.name)}&conferenceId=${encodeURIComponent(confData.id)}`);
      activeHomeownerNumberRef.current = normalizedHomeowner;

      setStatus('Dialing homeowner...');
      const dialResponse = await fetch('/api/signalwire/dial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conference_id: confData.id,
          room_name: confData.name,
          to: normalizedHomeowner,
          from: normalizedPainterCallerId
        })
      });
      const dialData = (await getJsonOrThrow(dialResponse, 'Failed to dial homeowner')) as DialResponse;
      activeCallSidRef.current = String(
        dialData?.sid ||
        dialData?.call_sid ||
        dialData?.callSid ||
        ''
      ) || null;
      callAnsweredRef.current = false;

      if (activeCallSidRef.current) {
        await fetch('/api/signalwire/conference-state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conferenceId: confData.id,
            metaPatch: {
              call_sid: activeCallSidRef.current
            }
          })
        }).catch(() => undefined);

        setStatus('Ringing homeowner...');
        const answerState = await waitForCallAnswer(activeCallSidRef.current);
        if (localEndRequestedRef.current) {
          return;
        }
        if (!answerState.answered) {
          await forceEndConference();
          if (roomSessionRef.current) {
            await roomSessionRef.current.leave().catch(() => undefined);
            roomSessionRef.current = null;
          }
          activeCallRef.current = false;
          setPhase('dropped');
          setStatus('Homeowner did not answer. You can call back.');
          return;
        }
      }

      activeCallRef.current = true;
      localEndRequestedRef.current = false;
      remoteEndingRef.current = false;
      estimateInviteSentRef.current = false;
      recordingStartedRef.current = false;
      setPhase('calling');
      setStatus('Phone call connected (audio-only).');
      watchCallHealth();
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
          to: activeHomeownerNumberRef.current,
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

  const enterQuoteMode = async () => {
    if (!conference?.id) return;
    setSettingQuoteMode(true);
    try {
      const response = await fetch('/api/signalwire/conference-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conferenceId: conference.id,
          mode: 'quote',
          metaPatch: {
            quote_mode: true,
            quote_started_at: new Date().toISOString()
          }
        })
      });
      await getJsonOrThrow(response, 'Failed to enter quote mode');
      setPhase('quoteDraft');
      setHasVideoFrame(false);
      setStatus('Quote mode active. Audio call continues.');
    } catch (error) {
      console.error('Quote mode error:', error);
      setStatus(`Error: ${(error as Error).message}`);
    } finally {
      setSettingQuoteMode(false);
    }
  };

  const endCall = async () => {
    localEndRequestedRef.current = true;
    activeCallRef.current = false;
    callAnsweredRef.current = false;
    if (findVideoTimerRef.current) {
      window.clearInterval(findVideoTimerRef.current);
      findVideoTimerRef.current = null;
    }
    stopConferenceWatch();

    try {
      if (activeConferenceIdRef.current) {
        await fetch('/api/signalwire/conference-state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conferenceId: activeConferenceIdRef.current,
            mode: 'ending'
          })
        }).catch(() => undefined);
      }

      await forceEndConference();

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
        if (trackHandlerRef.current && roomSessionRef.current.off) {
          roomSessionRef.current.off('track', trackHandlerRef.current);
        }
        if (memberJoinedHandlerRef.current && roomSessionRef.current.off) {
          roomSessionRef.current.off('member.joined', memberJoinedHandlerRef.current);
        }
        if (memberLeftHandlerRef.current && roomSessionRef.current.off) {
          roomSessionRef.current.off('member.left', memberLeftHandlerRef.current);
        }
        await roomSessionRef.current.leave();
        roomSessionRef.current = null;
      }
    } catch (error) {
      console.error('End call error:', error);
    }

    setPhase('ended');
    setConference(null);
    activeConferenceIdRef.current = null;
    activeConferenceNameRef.current = null;
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
    trackHandlerRef.current = null;
    memberJoinedHandlerRef.current = null;
    memberLeftHandlerRef.current = null;
    activeCallSidRef.current = null;
    setRemoteVideoStream(null);
    setStatus((prev) => prev.startsWith('Call ended') ? prev : 'Call ended.');
  };

  const callBack = async () => {
    setQuoteItem('');
    setQuotePrice('');
    setConference(null);
    setGuestLink('');
    setHasVideoFrame(false);
    setPhase('idle');
    await startPhoneCall();
  };

  const stageLabel = useMemo(() => {
    if (phase === 'idle') return 'Ready';
    if (phase === 'calling') return 'On Call';
    if (phase === 'videoInviteSent') return 'Video Estimate';
    if (phase === 'quoteDraft') return 'Create Quote';
    if (phase === 'dropped') return 'Dropped';
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
  const primaryActionColor = PRIMARY_COLOR_HEX;
  const disabledPrimaryActionColor = `${PRIMARY_COLOR_HEX}99`;

  return (
    <div style={{ minHeight: '100dvh', background: 'radial-gradient(circle at 15% 0%, #edf7ff 0%, #f5f7fb 55%, #eef2f8 100%)', color: '#fff', padding: '8px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', margin: '8px 0 12px 0' }}>
          <div style={{ fontSize: 12, color: '#92a0b5', letterSpacing: 1 }}>{stageLabel}</div>
          <div style={{ marginTop: 6, fontWeight: 600 }}>{status}</div>
        </div>

        {phase === 'idle' && (
          <div style={{ maxWidth: 440, margin: '0 auto', background: '#171a20', border: '1px solid #2a2f36', borderRadius: 14, padding: 16 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#b6c2d4', marginBottom: 8 }}>Call from (verified painter number)</label>
            <input
              value={painterCallerId}
              disabled
              style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #3a404a', background: '#0f1217', color: '#94a3b8', marginBottom: 10 }}
            />
            <label style={{ display: 'block', fontSize: 13, color: '#b6c2d4', marginBottom: 8 }}>Number to call</label>
            <input
              value={homeownerNumberInput}
              onChange={(event) => setHomeownerNumberInput(event.target.value)}
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
                background: isStartingCall ? disabledPrimaryActionColor : primaryActionColor,
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

        {(phase === 'calling' || phase === 'videoInviteSent' || phase === 'quoteDraft') && (
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
                : phase === 'videoInviteSent'
                  ? (hasVideoFrame ? 'Homeowner video connected.' : 'Waiting for homeowner video...')
                  : 'Build quote while audio call remains active.'}
            </div>
            {phase !== 'quoteDraft' && (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  background: '#000'
                }}
              />
            )}
            {phase !== 'quoteDraft' && !hasVideoFrame && (
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
            {phase === 'quoteDraft' && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: '#000',
                  padding: '72px 16px 96px',
                  color: '#d7dfeb'
                }}
              >
                <div style={{ marginBottom: 10, fontWeight: 700 }}>Create Quote</div>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 6, color: '#8ea0bb' }}>Item</label>
                <input
                  value={quoteItem}
                  onChange={(event) => setQuoteItem(event.target.value)}
                  placeholder="Interior Walls"
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 10,
                    border: '1px solid #2a3444',
                    background: '#0f131a',
                    color: '#fff',
                    marginBottom: 12
                  }}
                />
                <label style={{ display: 'block', fontSize: 12, marginBottom: 6, color: '#8ea0bb' }}>Price</label>
                <input
                  value={quotePrice}
                  onChange={(event) => setQuotePrice(event.target.value)}
                  placeholder="$2,500"
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 10,
                    border: '1px solid #2a3444',
                    background: '#0f131a',
                    color: '#fff'
                  }}
                />
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
                    background: isSendingVideoInvite ? disabledPrimaryActionColor : primaryActionColor,
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
              {phase === 'videoInviteSent' && (
                <button
                  onClick={enterQuoteMode}
                  disabled={isSettingQuoteMode}
                  style={{
                    height: 48,
                    borderRadius: 999,
                    border: 'none',
                    padding: '0 18px',
                    background: isSettingQuoteMode ? disabledPrimaryActionColor : primaryActionColor,
                    color: '#fff',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  {isSettingQuoteMode ? 'Starting...' : 'Create Quote'}
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

        {(phase === 'ended' || phase === 'dropped') && (
          <div style={phoneFrameStyle}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: '#000',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#7f8ba0',
                gap: 12
              }}
            >
              {phase === 'dropped' ? 'It looks like your call dropped unexpectedly.' : 'Call ended'}
              <button
                onClick={callBack}
                disabled={isStartingCall}
                style={{
                  border: 'none',
                  borderRadius: 999,
                  padding: '10px 18px',
                  color: '#fff',
                  background: isStartingCall ? disabledPrimaryActionColor : primaryActionColor,
                  fontWeight: 700
                }}
              >
                {isStartingCall ? 'Calling...' : 'Call Back'}
              </button>
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
