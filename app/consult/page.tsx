'use client';

import { Video as SWVideo } from '@signalwire/js';
import { PhoneOff, RotateCcw, Video, VideoOff } from 'lucide-react';
import firebase from '@/lib/firebase';
import {
  collection,
  doc,
  getFirestore,
  onSnapshot,
  query,
  where
} from 'firebase/firestore';
import React, { useCallback, useEffect, useRef, useState } from 'react';

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

const isLikelyFrontCameraLabel = (label: string) =>
  /front|user|facetime/i.test(label);

const isLikelyBackCameraLabel = (label: string) =>
  /back|rear|environment|world/i.test(label);

const getTouchDistance = (
  first: { clientX: number; clientY: number },
  second: { clientX: number; clientY: number }
) =>
  Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);

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

const isQuoteSubmittedPayload = (payload: any) => {
  const meta = payload?.meta || {};
  const submittedRaw =
    meta.quote_submitted ??
    meta.quoteSubmitted ??
    meta.quote_ready ??
    meta.quoteReady;
  return (
    submittedRaw === true ||
    String(submittedRaw || '').trim().toLowerCase() === 'true' ||
    String(submittedRaw || '').trim() === '1'
  );
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
  const payloadJson = String(meta?.quote_payload_json || '').trim();
  if (payloadJson) {
    try {
      const payload = JSON.parse(payloadJson);
      const rowsRaw = Array.isArray(payload?.rows) ? payload.rows : [];
      const rows = rowsRaw.map((row: any) => ({
        item: String(row?.item || ''),
        description: String(row?.description || ''),
        price: String(row?.price || '0.00')
      }));
      if (rows.length) {
        const payloadTotal = Number(payload?.totalPrice);
        return {
          rows,
          totalPrice: Number.isFinite(payloadTotal)
            ? payloadTotal
            : rows.reduce((sum: number, row: QuoteDisplayRow) => sum + (Number.parseFloat(row.price) || 0), 0),
          updatedAt: String(payload?.updatedAt || meta?.quote_updated_at || '')
        };
      }
    } catch {
      // no-op
    }
  }

  const rawRows =
    meta?.quote_pricing_rows ??
    meta?.quoteRows ??
    null;
  const rawRowsJson = meta?.quote_pricing_rows_json ?? meta?.quoteRowsJson ?? null;

  let parsedRows: any[] | null = null;

  if (Array.isArray(rawRows)) {
    parsedRows = rawRows;
  } else if (rawRows && typeof rawRows === 'object') {
    const values = Object.values(rawRows);
    if (values.length) {
      parsedRows = values;
    }
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
    if (Array.isArray(rawRowsJson)) {
      parsedRows = rawRowsJson;
    } else if (rawRowsJson && typeof rawRowsJson === 'object') {
      const values = Object.values(rawRowsJson);
      if (values.length) {
        parsedRows = values;
      }
    }
    const serializedRows = String(rawRowsJson || '').trim();
    if (!parsedRows && serializedRows) {
      try {
        const maybeParsed = JSON.parse(serializedRows);
        if (Array.isArray(maybeParsed)) {
          parsedRows = maybeParsed;
        }
      } catch {
        parsedRows = null;
      }
    }
  }

  if ((!parsedRows || !parsedRows.length) && String(meta?.quote_pricing_lines || '').trim()) {
    const lines = String(meta.quote_pricing_lines)
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    parsedRows = lines.map((line) => {
      const [item = '', description = '', price = '0.00'] = line.split('|');
      return { item, description, price };
    });
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
  const submittedQuoteRef = useRef<QuoteDisplay | null>(null);
  const lastSubmissionSignalRef = useRef<string>('');
  const quoteWatcherUnsubRef = useRef<(() => void) | null>(null);
  const watcherWaitingForIdsLoggedRef = useRef(false);
  const didInitRef = useRef(false);
  const [debugEnabled, setDebugEnabled] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const [status, setStatus] = useState('Preparing...');
  const [isVideoOff, setVideoOff] = useState(false);
  const [isEnded, setEnded] = useState(false);
  const [isRejoining, setRejoining] = useState(false);
  const [hasVideoFrame, setHasVideoFrame] = useState(false);
  const [endReason, setEndReason] = useState<'ended' | 'dropped'>('ended');
  const [isQuoteMode, setQuoteMode] = useState(false);
  const [isQuoteSubmitted, setQuoteSubmitted] = useState(false);
  const [submittedQuote, setSubmittedQuote] = useState<QuoteDisplay | null>(null);
  const [blockingError, setBlockingError] = useState<string>('');
  const [zoomSupported, setZoomSupported] = useState(false);
  const [zoomValue, setZoomValue] = useState(1);
  const [zoomRange, setZoomRange] = useState<{ min: number; max: number; step: number }>({
    min: 1,
    max: 1,
    step: 0.1
  });
  const pinchStartDistanceRef = useRef<number | null>(null);
  const pinchStartZoomRef = useRef<number | null>(null);
  const zoomApplyInFlightRef = useRef(false);
  const queuedZoomValueRef = useRef<number | null>(null);
  const lastZoomApplyAtRef = useRef(0);
  const firestore = getFirestore(firebase);

  useEffect(() => {
    isEndedRef.current = isEnded;
  }, [isEnded]);

  useEffect(() => {
    isQuoteModeRef.current = isQuoteMode;
  }, [isQuoteMode]);

  useEffect(() => {
    submittedQuoteRef.current = submittedQuote;
  }, [submittedQuote]);

  const pushDebugLog = useCallback((message: string) => {
    const stamp = new Date().toISOString().slice(11, 23);
    setDebugLogs((prev) => [...prev.slice(-13), `${stamp} ${message}`]);
    if (debugEnabled) {
      console.log(`[consult-debug] ${message}`);
    }
  }, [debugEnabled]);

  useEffect(() => {
    pushDebugLog(`Status: ${status}`);
  }, [status, pushDebugLog]);

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

  const stopQuoteWatcher = useCallback(() => {
    if (quoteWatcherUnsubRef.current) {
      quoteWatcherUnsubRef.current();
      quoteWatcherUnsubRef.current = null;
      pushDebugLog('Stopped Firestore quote watcher');
    }
    watcherWaitingForIdsLoggedRef.current = false;
  }, [pushDebugLog]);

  const startQuoteWatcher = useCallback(() => {
    if (!conferenceIdRef.current) return;
    stopQuoteWatcher();
    pushDebugLog('Starting Firestore quote watcher');

    const applyQuoteFromData = (data: Record<string, any>, source: string) => {
      const pricing = data?.pricing || {};
      const rowsRaw = Array.isArray(pricing.rows) ? pricing.rows : [];
      const rows = rowsRaw.map((row: any) => ({
        item: String(row?.item || ''),
        description: String(row?.description || ''),
        price: Number(row?.price || 0).toFixed(2)
      }));
      if (!rows.length) return;
      const totalPrice = Number(pricing.totalPrice);
      setSubmittedQuote({
        rows,
        totalPrice: Number.isFinite(totalPrice)
          ? totalPrice
          : rows.reduce((sum: number, row: QuoteDisplayRow) => sum + (Number.parseFloat(row.price) || 0), 0),
        updatedAt: String(pricing.updatedAt || data.updatedAt || data.createdAt || '')
      });
      setQuoteSubmitted(true);
      setStatus('Quote Submitted');
      pushDebugLog(`Quote loaded from Firestore watcher (${source})`);
    };

    if (!painterDocIdRef.current) {
      if (!watcherWaitingForIdsLoggedRef.current) {
        pushDebugLog('Watcher waiting for IDs (painter=missing, quote=unknown)');
        watcherWaitingForIdsLoggedRef.current = true;
      }
      return;
    }
    watcherWaitingForIdsLoggedRef.current = false;

    if (quoteIdRef.current) {
      const quoteRef = doc(
        firestore,
        'painters',
        painterDocIdRef.current,
        'quotes',
        quoteIdRef.current
      );
      quoteWatcherUnsubRef.current = onSnapshot(
        quoteRef,
        (snapshot) => {
          if (!snapshot.exists()) {
            pushDebugLog('Firestore watcher: quote doc not found yet');
            return;
          }
          applyQuoteFromData(snapshot.data() as Record<string, any>, 'doc');
        },
        (error) => {
          pushDebugLog(`Firestore watcher doc error: ${error.message}`);
        }
      );
      return;
    }

    const fallbackQuery = query(
      collection(firestore, 'painters', painterDocIdRef.current, 'quotes'),
      where('signalwireConferenceId', '==', conferenceIdRef.current)
    );
    quoteWatcherUnsubRef.current = onSnapshot(
      fallbackQuery,
      (snapshot) => {
        if (snapshot.empty) {
          pushDebugLog('Firestore watcher: waiting for first quote doc');
          return;
        }
        const quoteDoc = snapshot.docs[0];
        quoteIdRef.current = quoteDoc.id;
        pushDebugLog(`Firestore watcher: resolved quoteId=${quoteDoc.id}`);
        applyQuoteFromData(quoteDoc.data() as Record<string, any>, 'query');
      },
      (error) => {
        pushDebugLog(`Firestore watcher query error: ${error.message}`);
      }
    );
  }, [firestore, pushDebugLog, stopQuoteWatcher]);

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
    let initialStream: MediaStream;
    try {
      pushDebugLog('Requesting initial stream with facingMode=environment (exact)');
      initialStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { exact: 'environment' } }
      });
    } catch {
      pushDebugLog('Exact environment camera request failed; retrying with ideal environment');
      initialStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' } }
      });
    }
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
        return !isLikelyFrontCameraLabel(device.label);
      });
    if (candidate) {
      try {
        pushDebugLog(`Trying fallback camera: ${candidate.label || candidate.deviceId}`);
        const switchedVideoStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: candidate.deviceId } }
        });
        const switchedStream = switchedVideoStream;
        const switchedTrack = switchedStream.getVideoTracks()[0];
        const appearsBackCamera =
          isEnvironmentFacingTrack(switchedTrack) ||
          isLikelyBackCameraLabel(candidate.label) ||
          isLikelyBackCameraLabel(switchedTrack?.label || '');
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

    initialStream.getTracks().forEach((track) => track.stop());
    pushDebugLog('Hard fail: unable to confirm back camera');
    throw new Error(
      'Unable to lock to your back camera. Please allow camera access, close other camera apps, and try again.'
    );
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

  const configureZoom = useCallback((track: MediaStreamTrack | undefined) => {
    if (!track) {
      setZoomSupported(false);
      return;
    }
    const capabilities = (track as any).getCapabilities?.() || {};
    const zoomCapability = capabilities?.zoom;
    if (
      !zoomCapability ||
      typeof zoomCapability !== 'object' ||
      typeof zoomCapability.min !== 'number' ||
      typeof zoomCapability.max !== 'number'
    ) {
      setZoomSupported(false);
      return;
    }
    const min = Number(zoomCapability.min);
    const max = Number(zoomCapability.max);
    const stepRaw = Number(zoomCapability.step);
    const step = Number.isFinite(stepRaw) && stepRaw > 0 ? stepRaw : 0.1;
    const settings = (track as any).getSettings?.() || {};
    const currentRaw = Number(settings.zoom);
    const current = Number.isFinite(currentRaw) ? currentRaw : min;
    setZoomRange({ min, max, step });
    setZoomValue(Math.min(max, Math.max(min, current)));
    setZoomSupported(max > min);
    pushDebugLog(`Zoom capability detected: min=${min}, max=${max}, step=${step}, current=${current}`);
  }, [pushDebugLog]);

  const applyZoom = useCallback(async (nextZoom: number) => {
    if (!zoomSupported) return;
    const track = localStreamRef.current?.getVideoTracks?.()[0];
    if (!track) return;
    const { min, max } = zoomRange;
    const clamped = Math.min(max, Math.max(min, nextZoom));
    const normalized = Number(clamped.toFixed(4));
    try {
      await (track as any).applyConstraints?.({
        advanced: [{ zoom: normalized }]
      });
    } catch (error) {
      pushDebugLog(`Zoom apply failed: ${(error as Error).message}`);
    }
  }, [pushDebugLog, zoomRange, zoomSupported]);

  const queueZoomApply = useCallback((nextZoom: number) => {
    const { min, max } = zoomRange;
    const clamped = Math.min(max, Math.max(min, nextZoom));
    setZoomValue(clamped);
    queuedZoomValueRef.current = clamped;
    if (zoomApplyInFlightRef.current) return;

    const run = async () => {
      zoomApplyInFlightRef.current = true;
      try {
        while (queuedZoomValueRef.current !== null) {
          const value = queuedZoomValueRef.current;
          queuedZoomValueRef.current = null;
          const elapsed = Date.now() - lastZoomApplyAtRef.current;
          if (elapsed < 24) {
            await new Promise((resolve) => setTimeout(resolve, 24 - elapsed));
          }
          await applyZoom(value);
          lastZoomApplyAtRef.current = Date.now();
        }
      } finally {
        zoomApplyInFlightRef.current = false;
      }
    };

    void run();
  }, [applyZoom, zoomRange]);

  useEffect(() => {
    const preventGesture = (event: Event) => {
      if (!isQuoteMode) event.preventDefault();
    };
    const preventPinchTouch = (event: TouchEvent) => {
      if (!isQuoteMode && event.touches.length > 1) {
        event.preventDefault();
      }
    };

    document.addEventListener('gesturestart', preventGesture, { passive: false });
    document.addEventListener('gesturechange', preventGesture, { passive: false });
    document.addEventListener('gestureend', preventGesture, { passive: false });
    document.addEventListener('touchmove', preventPinchTouch, { passive: false });
    return () => {
      document.removeEventListener('gesturestart', preventGesture);
      document.removeEventListener('gesturechange', preventGesture);
      document.removeEventListener('gestureend', preventGesture);
      document.removeEventListener('touchmove', preventPinchTouch);
    };
  }, [isQuoteMode]);

  const handleTouchStart = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    if (!zoomSupported || isQuoteMode) return;
    if (event.touches.length !== 2) {
      pinchStartDistanceRef.current = null;
      pinchStartZoomRef.current = null;
      return;
    }
    event.preventDefault();
    const distance = getTouchDistance(event.touches[0], event.touches[1]);
    pinchStartDistanceRef.current = distance;
    pinchStartZoomRef.current = zoomValue;
  }, [isQuoteMode, zoomSupported, zoomValue]);

  const handleTouchMove = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    if (!zoomSupported || isQuoteMode) return;
    if (event.touches.length !== 2) return;
    const startDistance = pinchStartDistanceRef.current;
    const startZoom = pinchStartZoomRef.current;
    if (!startDistance || !startZoom) return;
    event.preventDefault();
    const nextDistance = getTouchDistance(event.touches[0], event.touches[1]);
    const ratio = nextDistance / startDistance;
    const rawZoom = startZoom * ratio;
    const { min, max } = zoomRange;
    const clamped = Math.min(max, Math.max(min, rawZoom));
    queueZoomApply(clamped);
  }, [isQuoteMode, queueZoomApply, zoomRange, zoomSupported]);

  const handleTouchEnd = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length < 2) {
      pinchStartDistanceRef.current = null;
      pinchStartZoomRef.current = null;
    }
  }, []);

  const joinConsult = useCallback(async (token: string) => {
    stopQuoteWatcher();
    await cleanupSession();
    setHasVideoFrame(false);
    setQuoteMode(false);
    setQuoteSubmitted(false);
    setSubmittedQuote(null);
    setBlockingError('');
    pushDebugLog('joinConsult(): begin');

    const stream = await getBackCameraStream();
    localStreamRef.current = stream;
    configureZoom(stream.getVideoTracks()[0]);
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
      sendAudio: false,
      sendVideo: true,
      receiveAudio: false,
      receiveVideo: true
    });
    pushDebugLog('Room joined with sendVideo=true');
    pushDebugLog('Using preselected local stream without outbound video restart');
    sessionRef.current = session;
    setHasVideoFrame(Boolean(previewReady));
  }, [cleanupSession, getBackCameraStream, pushDebugLog, stopQuoteWatcher]);

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
        const conferencePainterDocId = String(
          payload?.meta?.painter_doc_id ||
          payload?.meta?.painterDocId ||
          ''
        ).trim();
        if (conferencePainterDocId) {
          painterDocIdRef.current = conferencePainterDocId;
        }
        const conferenceQuoteId = String(
          payload?.meta?.quote_id ||
          payload?.meta?.quoteId ||
          ''
        ).trim();
        if (conferenceQuoteId) {
          quoteIdRef.current = conferenceQuoteId;
        }
        const submissionSignal = String(payload?.meta?.quote_submission_signal || '').trim();
        if (submissionSignal && submissionSignal !== lastSubmissionSignalRef.current) {
          lastSubmissionSignalRef.current = submissionSignal;
          setQuoteSubmitted(true);
          setStatus('Quote Submitted');
          pushDebugLog(`Quote submission signal detected: ${submissionSignal}`);
        }
        if (isQuoteSubmittedPayload(payload)) {
          setQuoteSubmitted(true);
          setStatus('Quote Submitted');
          pushDebugLog('Quote submitted trigger detected');
        }

        if (isQuoteModePayload(payload) && !isQuoteModeRef.current) {
          isQuoteModeRef.current = true;
          pushDebugLog('Conference mode switched to quote');
          setQuoteMode(true);
          setHasVideoFrame(false);
          setStatus('Your quote is being completed');
          startQuoteWatcher();
          const session = sessionRef.current;
          if (session) {
            Promise.resolve(session.stopOutboundVideo?.())
              .then(() => pushDebugLog('Outbound video stopped in quote mode'))
              .catch(() => pushDebugLog('Outbound video stop skipped'));
          }
          if (!submittedQuoteRef.current) {
            const nextQuote = parseQuoteMeta(payload?.meta || {});
            if (nextQuote) {
              setSubmittedQuote(nextQuote);
              setStatus('Your quote is ready');
              pushDebugLog('Quote loaded from conference metadata');
            }
          }
          return;
        }

        if (isQuoteModeRef.current) {
          if (!submittedQuoteRef.current) {
            const nextQuote = parseQuoteMeta(payload?.meta || {});
            if (nextQuote) {
              setSubmittedQuote(nextQuote);
              setStatus('Your quote is ready');
              pushDebugLog('Quote loaded from conference metadata (poll)');
            }
          }
          if (!quoteWatcherUnsubRef.current) {
            startQuoteWatcher();
          }
        }
      } catch (error) {
        console.error('Consult conference watcher error:', error);
      }
    }, 1000);
  }, [cleanupSession, pushDebugLog, startQuoteWatcher, stopConferenceWatch]);

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
        const painterDocId = params.get('painterDocId');
        const quoteId = params.get('quoteId');
        roomNameRef.current = roomName || '';
        conferenceIdRef.current = conferenceId || '';
        painterDocIdRef.current = String(painterDocId || '').trim();
        quoteIdRef.current = String(quoteId || '').trim();
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

        setStatus('Requesting back camera...');
        await joinConsult(token);
        if (mounted) {
          setStatus('Connected. Keep talking on your phone call.');
          setBlockingError('');
          pushDebugLog('Status=Connected');
          setEnded(false);
          setEndReason('ended');
          localEndRequestedRef.current = false;
          remoteEndingRef.current = false;
          setVideoOff(false);
          watchConferenceState();
        }
      } catch (error) {
        console.error('Consult join error:', error);
        pushDebugLog(`Join error: ${(error as Error).message}`);
        if (mounted) {
          const message = (error as Error).message;
          setStatus(`Failed to join: ${message}`);
          setBlockingError(message);
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
      stopQuoteWatcher();
      cleanupSession();
    };
  }, []);

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
    stopQuoteWatcher();
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
    setQuoteSubmitted(false);
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
      setQuoteSubmitted(false);
      setSubmittedQuote(null);
      setBlockingError('');
      setStatus('Connected. Keep talking on your phone call.');
      watchConferenceState();
    } catch (error) {
      console.error('Rejoin error:', error);
      const message = (error as Error).message;
      setStatus(`Rejoin failed: ${message}`);
      setBlockingError(message);
      pushDebugLog(`Rejoin error: ${message}`);
    } finally {
      setRejoining(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#000',
        color: '#fff',
        touchAction: isQuoteMode ? 'pan-y' : 'none',
        overscrollBehavior: 'none'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#000' }}>
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
            {!!blockingError && (
              <div
                style={{
                  maxWidth: 300,
                  fontSize: 13,
                  lineHeight: 1.35,
                  color: '#ffd7d7',
                  background: 'rgba(127, 29, 29, 0.45)',
                  border: '1px solid rgba(248, 113, 113, 0.55)',
                  borderRadius: 10,
                  padding: '10px 12px',
                  textAlign: 'left'
                }}
              >
                {blockingError}
              </div>
            )}
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
                ) : isQuoteSubmitted ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      gap: 10,
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: 22, fontWeight: 700 }}>Quote Submitted</div>
                    <div style={{ color: '#9fb0c8', fontSize: 14 }}>
                      Your painter has sent your quote.
                    </div>
                  </div>
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
            {!isQuoteMode && zoomSupported && !isEnded && (
              <div
                style={{
                  position: 'absolute',
                  left: 10,
                  right: 10,
                  bottom: 92,
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(0,0,0,0.42)',
                  padding: '8px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}
              >
                <button
                  onClick={() => queueZoomApply(zoomValue - zoomRange.step)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 999,
                    border: 'none',
                    background: '#fff',
                    color: '#111',
                    fontWeight: 700
                  }}
                  aria-label="Zoom out"
                >
                  -
                </button>
                <input
                  type="range"
                  min={zoomRange.min}
                  max={zoomRange.max}
                  step={zoomRange.step}
                  value={zoomValue}
                  onChange={(event) => {
                    const next = Number(event.target.value);
                    queueZoomApply(next);
                  }}
                  style={{ flex: 1 }}
                  aria-label="Camera zoom"
                />
                <button
                  onClick={() => queueZoomApply(zoomValue + zoomRange.step)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 999,
                    border: 'none',
                    background: '#fff',
                    color: '#111',
                    fontWeight: 700
                  }}
                  aria-label="Zoom in"
                >
                  +
                </button>
              </div>
            )}
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
      {debugEnabled && (
        <div
          style={{
            position: 'fixed',
            left: 10,
            right: 10,
            bottom: 166,
            borderRadius: 12,
            background: 'rgba(15, 23, 42, 0.88)',
            border: '1px solid rgba(148, 163, 184, 0.5)',
            color: '#d1e0ff',
            padding: '10px 12px',
            fontSize: 11,
            lineHeight: 1.35,
            zIndex: 20
          }}
        >
          <div style={{ color: '#93c5fd', fontWeight: 700, marginBottom: 6 }}>
            Diagnostics
          </div>
          <div style={{ maxHeight: 140, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
            {debugLogs.length ? debugLogs.join('\n') : 'Waiting for events...'}
          </div>
        </div>
      )}
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
