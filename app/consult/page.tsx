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

const mergeStreamTracks = ({
  audioFrom,
  videoFrom
}: {
  audioFrom: MediaStream;
  videoFrom: MediaStream;
}) =>
  new MediaStream([
    ...videoFrom.getVideoTracks(),
    ...audioFrom.getAudioTracks()
  ]);

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

type QuoteDisplayRow = {
  item: string;
  description: string;
  price: string;
};

type QuoteDisplay = {
  rows: QuoteDisplayRow[];
  totalPrice: number;
  updatedAt: string;
};

const parseQuoteMeta = (meta: any): QuoteDisplay | null => {
  const rawRows =
    meta?.quote_pricing_rows ??
    meta?.quoteRows ??
    null;
  const rawRowsJson = meta?.quote_pricing_rows_json ?? meta?.quoteRowsJson ?? null;

  let parsedRows: any[] | null = null;

  if (Array.isArray(rawRows)) {
    parsedRows = rawRows;
  } else if (typeof rawRows === 'string' && rawRows.trim()) {
    try {
      const maybeParsed = JSON.parse(rawRows);
      if (Array.isArray(maybeParsed)) {
        parsedRows = maybeParsed;
      }
    } catch {
      // no-op
    }
  }

  if (!parsedRows && rawRowsJson) {
    const serializedRows = String(rawRowsJson || '').trim();
    if (!serializedRows) return null;
    try {
      const maybeParsed = JSON.parse(serializedRows);
      if (Array.isArray(maybeParsed)) {
        parsedRows = maybeParsed;
      }
    } catch {
      parsedRows = null;
    }
  }

  if (!parsedRows || !parsedRows.length) return null;

  try {
    const rows = parsedRows.map((row) => ({
      item: String(row?.item || ''),
      description: String(row?.description || ''),
      price: String(row?.price || '0.00')
    }));

    const parsedTotal = Number(meta?.quote_total_price);
    const totalPrice = Number.isFinite(parsedTotal)
      ? parsedTotal
      : rows.reduce((sum, row) => sum + (Number.parseFloat(row.price) || 0), 0);

    return {
      rows,
      totalPrice: Math.round(totalPrice * 100) / 100,
      updatedAt: String(meta?.quote_updated_at || '')
    };
  } catch {
    return null;
  }
};

const ConsultPage: React.FC = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const sessionRef = useRef<any>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const tokenRef = useRef<string>('');
  const roomNameRef = useRef<string>('');
  const conferenceIdRef = useRef<string>('');
  const painterDocIdRef = useRef<string>('');
  const quoteIdRef = useRef<string>('');
  const callSidRef = useRef<string | null>(null);
  const localEndRequestedRef = useRef(false);
  const conferenceWatchTimerRef = useRef<number | null>(null);
  const remoteEndingRef = useRef(false);
  const isEndedRef = useRef(false);
  const isQuoteModeRef = useRef(false);
  const quoteFetchInFlightRef = useRef(false);
  const didInitRef = useRef(false);
  const [debugEnabled, setDebugEnabled] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const [status, setStatus] = useState('Preparing...');
  const [isMuted, setMuted] = useState(false);
  const [isVideoOff, setVideoOff] = useState(false);
  const [isEnded, setEnded] = useState(false);
  const [isRejoining, setRejoining] = useState(false);
  const [hasVideoFrame, setHasVideoFrame] = useState(false);
  const [endReason, setEndReason] = useState<'ended' | 'dropped'>('ended');
  const [isQuoteMode, setQuoteMode] = useState(false);
  const [submittedQuote, setSubmittedQuote] = useState<QuoteDisplay | null>(null);

  useEffect(() => {
    isEndedRef.current = isEnded;
  }, [isEnded]);

  useEffect(() => {
    isQuoteModeRef.current = isQuoteMode;
  }, [isQuoteMode]);

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

  const stopConferenceWatch = useCallback(() => {
    if (conferenceWatchTimerRef.current) {
      window.clearInterval(conferenceWatchTimerRef.current);
      conferenceWatchTimerRef.current = null;
    }
  }, []);

  const endConferenceEverywhere = useCallback(async () => {
    if (!roomNameRef.current && !conferenceIdRef.current) return;
    try {
      await fetch('/api/signalwire/end-conference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: roomNameRef.current || undefined,
          conferenceId: conferenceIdRef.current || undefined,
          callSid: callSidRef.current || undefined
        })
      });
    } catch (error) {
      console.error('End conference from consult failed:', error);
    }
  }, []);

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

    // Single fallback attempt to avoid iOS Safari permission deadlocks from multiple getUserMedia hops.
    const candidate = prioritizedBack ||
      videoInputs.find((device) => {
        if (currentDeviceId && device.deviceId === currentDeviceId) return false;
        return !/front|user|facetime/i.test(device.label);
      });
    if (candidate) {
      try {
        pushDebugLog(`Trying fallback camera: ${candidate.label || candidate.deviceId}`);
        const switchedVideoStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: candidate.deviceId } }
        });
        const switchedStream = mergeStreamTracks({
          audioFrom: initialStream,
          videoFrom: switchedVideoStream
        });
        const switchedTrack = switchedStream.getVideoTracks()[0];
        const appearsBackCamera =
          isEnvironmentFacingTrack(switchedTrack) ||
          /back|rear|environment|world/i.test(candidate.label);
        if (appearsBackCamera) {
          pushDebugLog(`Switched to back camera: ${candidate.label || candidate.deviceId}`);
          initialStream.getVideoTracks().forEach((track) => track.stop());
          return switchedStream;
        }
        switchedStream.getVideoTracks().forEach((track) => track.stop());
      } catch {
        pushDebugLog(`Fallback candidate failed: ${candidate.label || candidate.deviceId}`);
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
    setQuoteMode(false);
    setSubmittedQuote(null);
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
    try {
      await session.stopOutboundVideo?.();
      await new Promise((resolve) => setTimeout(resolve, 180));
      await session.restoreOutboundVideo?.();
      pushDebugLog('Forced outbound video restart after join');
    } catch {
      // no-op
    }
    sessionRef.current = session;
    setHasVideoFrame(Boolean(previewReady));
  }, [cleanupSession, getBackCameraStream, pushDebugLog]);

  const watchConferenceState = useCallback(() => {
    stopConferenceWatch();
    conferenceWatchTimerRef.current = window.setInterval(async () => {
      if ((!roomNameRef.current && !conferenceIdRef.current) || isEndedRef.current) return;
      if (localEndRequestedRef.current) return;

      try {
        const endpoint = conferenceIdRef.current
          ? `/api/signalwire/conference-state?conferenceId=${encodeURIComponent(conferenceIdRef.current)}`
          : `/api/signalwire/conference-state?roomName=${encodeURIComponent(roomNameRef.current)}`;
        const response = await fetch(`${endpoint}&_ts=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'cache-control': 'no-cache',
            pragma: 'no-cache'
          }
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) return;

        if (!payload?.exists) {
          pushDebugLog('Conference missing while active -> dropped');
          await cleanupSession();
          setEndReason(remoteEndingRef.current ? 'ended' : 'dropped');
          setEnded(true);
          setHasVideoFrame(false);
          setStatus(
            remoteEndingRef.current
              ? 'Call ended.'
              : 'It looks like your call dropped unexpectedly.'
          );
          stopConferenceWatch();
          return;
        }

        if (payload?.mode === 'ending' && !localEndRequestedRef.current) {
          remoteEndingRef.current = true;
          await cleanupSession();
          setEndReason('ended');
          setEnded(true);
          setHasVideoFrame(false);
          setStatus('Call ended.');
          stopConferenceWatch();
          return;
        }

        const conferenceCallSid = String(payload?.meta?.call_sid || '').trim();
        if (conferenceCallSid) {
          callSidRef.current = conferenceCallSid;
        }
        const conferencePainterDocId = String(payload?.meta?.painter_doc_id || '').trim();
        if (conferencePainterDocId) {
          painterDocIdRef.current = conferencePainterDocId;
        }
        const conferenceQuoteId = String(payload?.meta?.quote_id || '').trim();
        if (conferenceQuoteId) {
          quoteIdRef.current = conferenceQuoteId;
        }

        const fetchLatestQuoteForConference = async () => {
          if (!conferenceIdRef.current || quoteFetchInFlightRef.current) return;
          quoteFetchInFlightRef.current = true;
          try {
            const params = new URLSearchParams({
              conferenceId: conferenceIdRef.current
            });
            if (painterDocIdRef.current) {
              params.set('painterDocId', painterDocIdRef.current);
            }
            if (quoteIdRef.current) {
              params.set('quoteId', quoteIdRef.current);
            }
            const quoteResponse = await fetch(
              `/api/quotes/by-conference?${params.toString()}&_ts=${Date.now()}`,
              {
                cache: 'no-store',
                headers: {
                  'cache-control': 'no-cache',
                  pragma: 'no-cache'
                }
              }
            );
            const quotePayload = await quoteResponse.json().catch(() => ({}));
            if (!quoteResponse.ok || !quotePayload?.found) return;

            const pricing = quotePayload?.pricing || {};
            const rowsRaw = Array.isArray(pricing?.rows) ? pricing.rows : [];
            const rows = rowsRaw.map((row: any) => ({
              item: String(row?.item || ''),
              description: String(row?.description || ''),
              price: Number(row?.price || 0).toFixed(2)
            }));
            if (!rows.length) return;

            const totalPrice = Number(pricing?.totalPrice);
            setSubmittedQuote({
              rows,
              totalPrice: Number.isFinite(totalPrice)
                ? totalPrice
                : rows.reduce((sum: number, row: QuoteDisplayRow) => sum + (Number.parseFloat(row.price) || 0), 0),
              updatedAt: String(pricing?.updatedAt || quotePayload?.updatedAt || '')
            });
            setStatus('Your quote is ready');
          } catch (error) {
            console.error('Consult quote fetch error:', error);
          } finally {
            quoteFetchInFlightRef.current = false;
          }
        };

        if (isQuoteModePayload(payload) && !isQuoteModeRef.current) {
          const nextQuote = parseQuoteMeta(payload?.meta || {});
          pushDebugLog('Conference mode switched to quote');
          setQuoteMode(true);
          setHasVideoFrame(false);
          setSubmittedQuote(nextQuote);
          setStatus(nextQuote ? 'Your quote is ready' : 'Your quote is being completed');
          const session = sessionRef.current;
          if (session) {
            try {
              await session.stopOutboundVideo?.();
            } catch {
              // no-op
            }
          }
          await fetchLatestQuoteForConference();
          return;
        }

        if (isQuoteModeRef.current) {
          const nextQuote = parseQuoteMeta(payload?.meta || {});
          if (nextQuote) {
            setSubmittedQuote(nextQuote);
            setStatus('Your quote is ready');
          } else {
            await fetchLatestQuoteForConference();
          }
        }
      } catch (error) {
        console.error('Consult conference watcher error:', error);
      }
    }, 1000);
  }, [cleanupSession, pushDebugLog, stopConferenceWatch]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setDebugEnabled(params.get('debug') === '1');
  }, []);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    let mounted = true;

    const start = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        let token = params.get('token');
        const roomName = params.get('room');
        const conferenceId = params.get('conferenceId');
        roomNameRef.current = roomName || '';
        conferenceIdRef.current = conferenceId || '';
        if (!token) {
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
          setEndReason('ended');
          localEndRequestedRef.current = false;
          remoteEndingRef.current = false;
          setMuted(false);
          setVideoOff(false);
          watchConferenceState();
        }
      } catch (error) {
        console.error('Consult join error:', error);
        pushDebugLog(`Join error: ${(error as Error).message}`);
        if (mounted) {
          setStatus(`Failed to join: ${(error as Error).message}`);
          setEndReason('dropped');
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
      stopConferenceWatch();
      cleanupSession();
    };
  }, []);

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
    localEndRequestedRef.current = true;
    stopConferenceWatch();
    if (conferenceIdRef.current) {
      await fetch('/api/signalwire/conference-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conferenceId: conferenceIdRef.current,
          mode: 'ending'
        })
      }).catch(() => undefined);
    }
    await endConferenceEverywhere();
    await cleanupSession();
    pushDebugLog('Call ended by user');
    setEndReason('ended');
    setEnded(true);
    setQuoteMode(false);
    setSubmittedQuote(null);
    setHasVideoFrame(false);
    setStatus('Call ended.');
  };

  const rejoin = async () => {
    if (!tokenRef.current) return;
    setRejoining(true);
    try {
      setStatus('Rejoining consult...');
      pushDebugLog('Rejoining consult');
      localEndRequestedRef.current = false;
      remoteEndingRef.current = false;
      await joinConsult(tokenRef.current);
      setEnded(false);
      setEndReason('ended');
      setQuoteMode(false);
      setSubmittedQuote(null);
      setStatus('Connected');
      watchConferenceState();
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
            <div>{endReason === 'dropped' ? 'It looks like your call dropped unexpectedly.' : 'Call ended'}</div>
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
                {isRejoining ? 'Calling...' : 'Call Back'}
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
            {!hasVideoFrame && !isQuoteMode && (
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
            {isQuoteMode && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: '#000',
                  color: '#d2d7df',
                  padding: '24px 12px 96px',
                  overflowY: 'auto'
                }}
              >
                {submittedQuote ? (
                  <>
                    <div style={{ marginBottom: 10, fontWeight: 700, fontSize: 17 }}>Your Quote</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                      <colgroup>
                        <col style={{ width: '30%' }} />
                        <col style={{ width: '42%' }} />
                        <col style={{ width: '28%' }} />
                      </colgroup>
                      <thead>
                        <tr>
                          <th style={quoteHeaderCellStyle}>Item</th>
                          <th style={quoteHeaderCellStyle}>Description</th>
                          <th style={quoteHeaderCellStyle}>Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submittedQuote.rows.map((row, index) => (
                          <tr key={`${row.item}-${row.description}-${index}`} style={{ borderTop: '1px solid #1f2937' }}>
                            <td style={quoteCellStyle}>
                              <div style={quoteDisplayCellStyle}>{row.item || '-'}</div>
                            </td>
                            <td style={quoteCellStyle}>
                              <div style={quoteDisplayCellStyle}>{row.description || '-'}</div>
                            </td>
                            <td style={quoteCellStyle}>
                              <div style={quoteDisplayCellStyle}>${row.price}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ marginTop: 12, color: '#9fb0c8', fontSize: 13 }}>
                      Total: ${submittedQuote.totalPrice.toFixed(2)}
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      gap: 12
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        border: '3px solid rgba(255,255,255,0.25)',
                        borderTopColor: '#fff',
                        animation: 'consult-spin 1s linear infinite'
                      }}
                    />
                    <div>Your quote is being completed</div>
                  </div>
                )}
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
              {!isQuoteMode && (
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
              )}
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
      <style>{`
        @keyframes consult-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const quoteHeaderCellStyle: React.CSSProperties = {
  textAlign: 'left',
  color: '#8ea0bb',
  fontSize: 12,
  fontWeight: 700,
  padding: '8px 4px'
};

const quoteCellStyle: React.CSSProperties = {
  padding: '8px 4px',
  verticalAlign: 'middle'
};

const quoteDisplayCellStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #2a3444',
  borderRadius: 10,
  background: '#0f131a',
  color: '#fff',
  padding: '8px 10px',
  fontSize: 13,
  minHeight: 34,
  display: 'flex',
  alignItems: 'center'
};

export default ConsultPage;
