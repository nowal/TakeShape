'use client';

import { Video as SWVideo } from '@signalwire/js';
import { PhoneOff, Video, VideoOff } from 'lucide-react';
import firebase from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  updateDoc,
  where
} from 'firebase/firestore';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useViewport } from '@/context/viewport';
import { PRIMARY_COLOR_HEX } from '@/constants/brand-color';

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

const HIGH_QUALITY_BACK_CAMERA_CONSTRAINTS: MediaTrackConstraints = {
  // Bias capture toward detail-rich HD for estimate walkthroughs.
  width: { min: 1280, ideal: 1920 },
  height: { min: 720, ideal: 1080 },
  frameRate: { min: 24, ideal: 30, max: 30 },
  aspectRatio: { ideal: 16 / 9 }
};

const FALLBACK_BACK_CAMERA_CONSTRAINTS: MediaTrackConstraints = {
  width: { ideal: 1920 },
  height: { ideal: 1080 },
  frameRate: { ideal: 30, max: 30 }
};

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

const isQuoteAcceptedPayload = (payload: any) => {
  const meta = payload?.meta || {};
  const acceptedRaw =
    meta.quote_accepted ??
    meta.quoteAccepted ??
    meta.quote_accepted_at ??
    meta.quoteAcceptedAt;
  return (
    acceptedRaw === true ||
    String(acceptedRaw || '').trim().toLowerCase() === 'true' ||
    String(acceptedRaw || '').trim() === '1' ||
    Boolean(
      String(
        meta.quote_accepted_at ??
        meta.quoteAcceptedAt ??
        ''
      ).trim()
    )
  );
};

const isQuoteSessionClosedPayload = (payload: any) => {
  const meta = payload?.meta || {};
  const closedRaw =
    meta.quote_session_closed ??
    meta.quoteSessionClosed ??
    meta.quote_call_closed ??
    meta.quoteCallClosed;
  return (
    closedRaw === true ||
    String(closedRaw || '').trim().toLowerCase() === 'true' ||
    String(closedRaw || '').trim() === '1'
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

type ProviderProfile = {
  businessName: string;
  logoUrl: string;
  termsAndConditionsUrl: string;
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
  const viewport = useViewport();
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
  const roomAudioEnabledRef = useRef(false);
  const preferredBackCameraDeviceIdRef = useRef<string | null>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const signaturePointerIdRef = useRef<number | null>(null);
  const signatureLastPointRef = useRef<{ x: number; y: number } | null>(null);
  const signatureHasStrokeRef = useRef(false);
  const [debugEnabled, setDebugEnabled] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const [status, setStatus] = useState('Preparing...');
  const [isVideoOff, setVideoOff] = useState(false);
  const [isEnded, setEnded] = useState(false);
  const [hasVideoFrame, setHasVideoFrame] = useState(false);
  const [endReason, setEndReason] = useState<'ended' | 'dropped'>('ended');
  const [isQuoteMode, setQuoteMode] = useState(false);
  const [isQuoteSubmitted, setQuoteSubmitted] = useState(false);
  const [isQuoteAccepted, setQuoteAccepted] = useState(false);
  const [isQuoteSessionClosed, setQuoteSessionClosed] = useState(false);
  const [submittedQuote, setSubmittedQuote] = useState<QuoteDisplay | null>(null);
  const [blockingError, setBlockingError] = useState<string>('');
  const [providerDocId, setProviderDocId] = useState('');
  const [providerProfile, setProviderProfile] = useState<ProviderProfile>({
    businessName: '',
    logoUrl: '',
    termsAndConditionsUrl: ''
  });
  const [isAcceptModalOpen, setAcceptModalOpen] = useState(false);
  const [hasReviewedTerms, setHasReviewedTerms] = useState(false);
  const [signatureError, setSignatureError] = useState('');
  const [hasSignature, setHasSignature] = useState(false);
  const [isSubmittingAcceptance, setSubmittingAcceptance] = useState(false);
  const [showAcceptedScreen, setShowAcceptedScreen] = useState(false);
  const [zoomSupported, setZoomSupported] = useState(false);
  const [zoomValue, setZoomValue] = useState(1);
  const [zoomRange, setZoomRange] = useState<{ min: number; max: number; step: number }>({
    min: 1,
    max: 1,
    step: 0.1
  });
  const pinchStartDistanceRef = useRef<number | null>(null);
  const pinchStartZoomRef = useRef<number | null>(null);
  const zoomApplyRafRef = useRef<number | null>(null);
  const targetZoomValueRef = useRef<number | null>(null);
  const appliedZoomValueRef = useRef<number>(1);
  const quoteAcceptedRef = useRef(false);
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

  useEffect(() => {
    quoteAcceptedRef.current = isQuoteAccepted;
  }, [isQuoteAccepted]);

  useEffect(() => {
    if (!isQuoteAccepted) return;
    setShowAcceptedScreen(true);
  }, [isQuoteAccepted]);

  useEffect(() => {
    let cancelled = false;

    const loadProviderProfile = async () => {
      if (!providerDocId) return;
      try {
        const painterDocRef = doc(firestore, 'painters', providerDocId);
        const painterDoc = await getDoc(painterDocRef);
        if (!painterDoc.exists() || cancelled) return;
        const data = painterDoc.data() as Record<string, any>;
        if (cancelled) return;
        setProviderProfile({
          businessName: String(data.businessName || data.name || ''),
          logoUrl: String(data.logoUrl || ''),
          termsAndConditionsUrl: String(
            data.termsAndConditionsUrl || data.termsUrl || ''
          )
        });
      } catch (error) {
        console.error('Failed to load provider profile:', error);
      }
    };

    loadProviderProfile();

    return () => {
      cancelled = true;
    };
  }, [firestore, providerDocId]);

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

  const publishHomeownerVideoState = useCallback(async (enabled: boolean) => {
    if (!conferenceIdRef.current && !roomNameRef.current) return;
    try {
      await fetch('/api/signalwire/conference-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conferenceId: conferenceIdRef.current || undefined,
          roomName: roomNameRef.current || undefined,
          metaPatch: {
            homeowner_video_enabled: enabled,
            homeowner_video_updated_at: new Date().toISOString()
          }
        })
      });
    } catch {
      // no-op
    }
  }, []);

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
      const nextAccepted = Boolean(
        data?.quoteAccepted || data?.quoteAcceptedAt
      );
      setQuoteAccepted(nextAccepted);
      if (nextAccepted) {
        setStatus('Congratulations on Accepting Your Quote!');
      } else {
        setStatus('Quote Submitted');
      }
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

  const resolveQuoteDocRef = useCallback(async () => {
    const painterDocId = painterDocIdRef.current;
    if (!painterDocId) return null;

    if (quoteIdRef.current) {
      return doc(
        firestore,
        'painters',
        painterDocId,
        'quotes',
        quoteIdRef.current
      );
    }

    if (!conferenceIdRef.current) return null;

    const snapshot = await getDocs(
      query(
        collection(firestore, 'painters', painterDocId, 'quotes'),
        where(
          'signalwireConferenceId',
          '==',
          conferenceIdRef.current
        )
      )
    );
    if (snapshot.empty) return null;

    quoteIdRef.current = snapshot.docs[0].id;
    return snapshot.docs[0].ref;
  }, [firestore]);

  const concludeAcceptedQuoteSession = useCallback(async () => {
    localEndRequestedRef.current = true;
    stopConferenceWatch();
    stopQuoteWatcher();
    await cleanupSession();
    setEnded(false);
    setQuoteMode(true);
    setQuoteSubmitted(true);
    setQuoteAccepted(true);
    setQuoteSessionClosed(true);
    setHasVideoFrame(false);
    setStatus('Quote accepted. Call ended.');
  }, [cleanupSession, stopConferenceWatch, stopQuoteWatcher]);

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
        video: {
          ...HIGH_QUALITY_BACK_CAMERA_CONSTRAINTS,
          facingMode: { exact: 'environment' }
        }
      });
    } catch {
      pushDebugLog('Exact environment camera request failed; retrying with ideal environment');
      try {
        initialStream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            ...HIGH_QUALITY_BACK_CAMERA_CONSTRAINTS,
            facingMode: { ideal: 'environment' }
          }
        });
      } catch {
        pushDebugLog('Strict HD constraints failed; retrying with relaxed HD constraints');
        initialStream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            ...FALLBACK_BACK_CAMERA_CONSTRAINTS,
            facingMode: { ideal: 'environment' }
          }
        });
      }
    }
    const initialVideoTrack = initialStream.getVideoTracks()[0];
    preferredBackCameraDeviceIdRef.current =
      String(initialVideoTrack?.getSettings?.()?.deviceId || '').trim() || null;
    if (initialVideoTrack && 'contentHint' in initialVideoTrack) {
      initialVideoTrack.contentHint = 'detail';
    }
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
          audio: false,
          video: {
            ...HIGH_QUALITY_BACK_CAMERA_CONSTRAINTS,
            deviceId: { exact: candidate.deviceId }
          }
        });
        const switchedStream = switchedVideoStream;
        const switchedTrack = switchedStream.getVideoTracks()[0];
        if (switchedTrack && 'contentHint' in switchedTrack) {
          switchedTrack.contentHint = 'detail';
        }
        const appearsBackCamera =
          isEnvironmentFacingTrack(switchedTrack) ||
          isLikelyBackCameraLabel(candidate.label) ||
          isLikelyBackCameraLabel(switchedTrack?.label || '');
        if (appearsBackCamera) {
          pushDebugLog(`Switched to back camera: ${candidate.label || candidate.deviceId}`);
          preferredBackCameraDeviceIdRef.current = candidate.deviceId || null;
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

  const tuneOutboundVideoSender = useCallback(async (session: any) => {
    const peerConnection =
      session?.peerConnection ||
      session?._peerConnection ||
      session?.publisher?.peerConnection ||
      null;
    if (!peerConnection?.getSenders) return;

    const videoSenders: RTCRtpSender[] = peerConnection
      .getSenders()
      .filter((sender: RTCRtpSender) => sender?.track?.kind === 'video');

    await Promise.all(
      videoSenders.map(async (sender) => {
        try {
          const params = sender.getParameters?.() || {};
          const encodings = Array.isArray((params as any).encodings) && (params as any).encodings.length
            ? (params as any).encodings
            : [{}];

          (params as any).encodings = encodings.map((encoding: Record<string, unknown>) => ({
            ...encoding,
            maxBitrate: 2_500_000,
            maxFramerate: 30,
            scaleResolutionDownBy: 1
          }));
          (params as any).degradationPreference = 'maintain-resolution';

          if (sender.setParameters) {
            await sender.setParameters(params as RTCRtpSendParameters);
            pushDebugLog('Applied outbound video sender quality hints');
          }
        } catch (error) {
          pushDebugLog(`Video sender tuning skipped: ${(error as Error).message}`);
        }
      })
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
    appliedZoomValueRef.current = Math.min(max, Math.max(min, current));
    targetZoomValueRef.current = appliedZoomValueRef.current;
    setZoomSupported(max > min);
    pushDebugLog(`Zoom capability detected: min=${min}, max=${max}, step=${step}, current=${current}`);
  }, [pushDebugLog]);

  const restoreBackCameraVideoTrack = useCallback(async () => {
    const currentStream = localStreamRef.current;
    const currentAudioTracks = currentStream?.getAudioTracks?.() || [];
    const nextCameraStream = await getBackCameraStream();
    const nextVideoTrack = nextCameraStream.getVideoTracks()[0];

    if (!nextVideoTrack) {
      nextCameraStream.getTracks().forEach((track) => track.stop());
      throw new Error('Unable to restore the back camera.');
    }

    if ('contentHint' in nextVideoTrack) {
      nextVideoTrack.contentHint = 'detail';
    }

    const nextStream = new MediaStream([
      nextVideoTrack,
      ...currentAudioTracks
    ]);

    const session = sessionRef.current;
    if (session?.setLocalStream) {
      await session.setLocalStream(nextStream);
      pushDebugLog('setLocalStream() applied while restoring back camera');
    } else {
      const peerConnection =
        session?.peerConnection ||
        session?._peerConnection ||
        session?.publisher?.peerConnection ||
        null;
      const videoSender = peerConnection?.getSenders?.()
        ?.find((sender: RTCRtpSender) => sender?.track?.kind === 'video');
      if (videoSender?.replaceTrack) {
        await videoSender.replaceTrack(nextVideoTrack);
        pushDebugLog('replaceTrack() applied while restoring back camera');
      }
    }

    localStreamRef.current = nextStream;
    configureZoom(nextVideoTrack);
    nextVideoTrack.enabled = true;
    nextVideoTrack.onended = () => pushDebugLog('Local video track ended');
    nextVideoTrack.onmute = () => pushDebugLog('Local video track muted');
    nextVideoTrack.onunmute = () => pushDebugLog('Local video track unmuted');
    await attachLocalStreamPreview(nextStream);

    currentStream?.getVideoTracks?.().forEach((track) => {
      if (track !== nextVideoTrack) {
        track.stop();
      }
    });
    nextCameraStream.getAudioTracks().forEach((track) => track.stop());
  }, [attachLocalStreamPreview, configureZoom, getBackCameraStream, pushDebugLog]);

  const snapToZoomStep = useCallback((value: number) => {
    const { min, max, step } = zoomRange;
    const clamped = Math.min(max, Math.max(min, value));
    if (!Number.isFinite(step) || step <= 0) return Number(clamped.toFixed(4));
    const snapped = Math.round((clamped - min) / step) * step + min;
    return Number(Math.min(max, Math.max(min, snapped)).toFixed(4));
  }, [zoomRange]);

  const applyZoom = useCallback((nextZoom: number) => {
    if (!zoomSupported) return;
    const track = localStreamRef.current?.getVideoTracks?.()[0];
    if (!track) return;
    const { min, max } = zoomRange;
    const clamped = Math.min(max, Math.max(min, nextZoom));
    const normalized = Number(clamped.toFixed(4));
    void (track as any).applyConstraints?.({
        advanced: [{ zoom: normalized }]
      }).catch((error: Error) => {
        pushDebugLog(`Zoom apply failed: ${error.message}`);
      });
  }, [pushDebugLog, zoomRange, zoomSupported]);

  const queueZoomApply = useCallback((
    nextZoom: number,
    opts?: { immediate?: boolean }
  ) => {
    const snappedTarget = snapToZoomStep(nextZoom);
    targetZoomValueRef.current = snappedTarget;
    setZoomValue(snappedTarget);

    if (opts?.immediate) {
      appliedZoomValueRef.current = snappedTarget;
      applyZoom(snappedTarget);
      return;
    }

    if (zoomApplyRafRef.current !== null) return;

    const flush = () => {
      const target = targetZoomValueRef.current;
      if (target === null) {
        zoomApplyRafRef.current = null;
        return;
      }

      const current = appliedZoomValueRef.current;
      const delta = target - current;
      const nextValue = Math.abs(delta) < 0.003
        ? target
        : snapToZoomStep(current + delta * 0.28);

      appliedZoomValueRef.current = nextValue;
      applyZoom(nextValue);

      if (Math.abs(target - nextValue) < 0.002) {
        appliedZoomValueRef.current = target;
        applyZoom(target);
        if (targetZoomValueRef.current === target) {
          zoomApplyRafRef.current = null;
          return;
        }
      }

      zoomApplyRafRef.current = window.requestAnimationFrame(flush);
    };

    zoomApplyRafRef.current = window.requestAnimationFrame(flush);
  }, [applyZoom, snapToZoomStep]);

  useEffect(() => {
    return () => {
      if (zoomApplyRafRef.current !== null) {
        window.cancelAnimationFrame(zoomApplyRafRef.current);
      }
      zoomApplyRafRef.current = null;
      targetZoomValueRef.current = null;
    };
  }, []);

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
      if (targetZoomValueRef.current !== null) {
        queueZoomApply(targetZoomValueRef.current, { immediate: true });
      }
    }
  }, [queueZoomApply]);

  const joinConsult = useCallback(async (token: string) => {
    stopQuoteWatcher();
    await cleanupSession();
    setHasVideoFrame(false);
    setQuoteMode(false);
    setQuoteSubmitted(false);
    setSubmittedQuote(null);
    setBlockingError('');
    pushDebugLog('joinConsult(): begin');

    const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number) => {
      let timer: ReturnType<typeof setTimeout> | null = null;
      try {
        return await Promise.race([
          promise,
          new Promise<T>((_, reject) => {
            timer = setTimeout(() => {
              reject(new Error('Timed out while requesting microphone permission.'));
            }, timeoutMs);
          })
        ]);
      } finally {
        if (timer) clearTimeout(timer);
      }
    };

    let roomAudioEnabled = false;
    const cameraStream = await getBackCameraStream();
    let stream: MediaStream | null = null;
    let micTrack: MediaStreamTrack | null = null;
    try {
      const tracks: MediaStreamTrack[] = [
        ...cameraStream.getVideoTracks()
      ];

      if (roomAudioEnabled) {
        setStatus('Requesting microphone...');
        pushDebugLog('Requesting microphone stream');
        try {
          const micStream = await withTimeout(
            navigator.mediaDevices.getUserMedia({
              audio: true,
              video: false
            }),
            12000
          );
          micTrack = micStream.getAudioTracks()[0] || null;
          if (!micTrack) {
            throw new Error('Unable to acquire microphone audio.');
          }
          tracks.push(micTrack);
        } catch (error) {
          roomAudioEnabled = false;
          roomAudioEnabledRef.current = false;
          pushDebugLog(
            `Microphone request failed; continuing video-only: ${(error as Error).message}`
          );
          setStatus(
            'Microphone unavailable while on phone call. Continuing video-only.'
          );
        }
      }

      stream = new MediaStream(tracks);
    } catch (error) {
      cameraStream.getTracks().forEach((track) => track.stop());
      throw error;
    }

    localStreamRef.current = stream;
    configureZoom(stream.getVideoTracks()[0]);
    setQuoteAccepted(false);
    setShowAcceptedScreen(false);
    setAcceptModalOpen(false);
    setQuoteSessionClosed(false);
    stream.getVideoTracks().forEach((track) => {
      track.enabled = true;
      pushDebugLog(`Local video track enabled=${track.enabled} muted=${track.muted} readyState=${track.readyState}`);
      track.onended = () => pushDebugLog('Local video track ended');
      track.onmute = () => pushDebugLog('Local video track muted');
      track.onunmute = () => pushDebugLog('Local video track unmuted');
    });
    const previewReady = await attachLocalStreamPreview(stream);
    pushDebugLog(`Local preview ready=${previewReady}`);

    setStatus('Joining room...');
    const joinSession = async (opts: {
      sendAudio: boolean;
      receiveAudio: boolean;
      localStream: MediaStream;
      timeoutMs: number;
    }) => {
      const session = new SWVideo.RoomSession({
        token,
        localStream: opts.localStream
      });

      try {
        await withTimeout(
          session.join({
            sendAudio: opts.sendAudio,
            sendVideo: true,
            receiveAudio: opts.receiveAudio,
            receiveVideo: true
          }),
          opts.timeoutMs
        );
        return session;
      } catch (error) {
        try {
          await session.leave();
        } catch {
          // no-op
        }
        throw error;
      }
    };

    let session: any = null;
    try {
      session = await joinSession({
        sendAudio: roomAudioEnabled,
        receiveAudio: roomAudioEnabled,
        localStream: stream,
        timeoutMs: roomAudioEnabled ? 15000 : 12000
      });
    } catch (error) {
      if (!roomAudioEnabled) {
        throw error;
      }

      pushDebugLog(
        `Audio room join failed; retrying video-only: ${(error as Error).message}`
      );
      setStatus(
        'Audio room join failed while phone call is active. Retrying video-only...'
      );
      roomAudioEnabled = false;
      roomAudioEnabledRef.current = false;
      if (micTrack) {
        micTrack.stop();
        micTrack = null;
      }
      const retryStream = new MediaStream([
        ...cameraStream.getVideoTracks()
      ]);
      localStreamRef.current = retryStream;
      session = await joinSession({
        sendAudio: false,
        receiveAudio: false,
        localStream: retryStream,
        timeoutMs: 12000
      });
    }

    await tuneOutboundVideoSender(session);
    pushDebugLog('Room joined with sendVideo=true');
    pushDebugLog(
      roomAudioEnabled
        ? 'Room joined with sendAudio=true'
        : 'Room joined with sendAudio=false (fallback)'
    );
    pushDebugLog('Using preselected local stream without outbound video restart');
    sessionRef.current = session;
    setHasVideoFrame(Boolean(previewReady));
  }, [cleanupSession, getBackCameraStream, pushDebugLog, stopQuoteWatcher, tuneOutboundVideoSender]);

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

        const nextQuoteAccepted = isQuoteAcceptedPayload(payload);
        const nextQuoteSessionClosed =
          isQuoteSessionClosedPayload(payload);

        if (!payload?.exists) {
          pushDebugLog('Conference missing while active -> ended');
          if (quoteAcceptedRef.current) {
            await concludeAcceptedQuoteSession();
            return;
          }
          await cleanupSession();
          setEndReason('ended');
          setEnded(true);
          setHasVideoFrame(false);
          setStatus('Call ended.');
          stopConferenceWatch();
          return;
        }

        if (payload?.mode === 'ending' && !localEndRequestedRef.current) {
          if (nextQuoteAccepted || quoteAcceptedRef.current) {
            await concludeAcceptedQuoteSession();
            return;
          }
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
          setProviderDocId(conferencePainterDocId);
        }
        const conferenceQuoteId = String(
          payload?.meta?.quote_id ||
          payload?.meta?.quoteId ||
          ''
        ).trim();
        if (conferenceQuoteId) {
          quoteIdRef.current = conferenceQuoteId;
        }
        if (nextQuoteAccepted && !quoteAcceptedRef.current) {
          setQuoteAccepted(true);
          setStatus('Congratulations on Accepting Your Quote!');
          pushDebugLog('Quote accepted signal detected');
        }
        if (nextQuoteSessionClosed) {
          await concludeAcceptedQuoteSession();
          return;
        }
        const submissionSignal = String(payload?.meta?.quote_submission_signal || '').trim();
        if (submissionSignal && submissionSignal !== lastSubmissionSignalRef.current) {
          lastSubmissionSignalRef.current = submissionSignal;
          setQuoteSubmitted(true);
          if (!quoteAcceptedRef.current) {
            setStatus('Quote Submitted');
          }
          pushDebugLog(`Quote submission signal detected: ${submissionSignal}`);
        }
        if (isQuoteSubmittedPayload(payload)) {
          setQuoteSubmitted(true);
          if (!quoteAcceptedRef.current) {
            setStatus('Quote Submitted');
          }
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
  }, [
    cleanupSession,
    concludeAcceptedQuoteSession,
    pushDebugLog,
    startQuoteWatcher,
    stopConferenceWatch,
  ]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setDebugEnabled(params.get('debug') === '1');
    roomAudioEnabledRef.current = false;
  }, []);

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message =
        reason instanceof Error
          ? reason.message
          : typeof reason === 'string'
            ? reason
            : '';
      if (
        message.includes('createDeviceWatcher()') &&
        message.includes('ask the user for permissions')
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
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
        setProviderDocId(String(painterDocId || '').trim());
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
          setStatus('Connected with video only.');
          setBlockingError('');
          pushDebugLog('Status=Connected');
          setEnded(false);
          setEndReason('ended');
          localEndRequestedRef.current = false;
          remoteEndingRef.current = false;
          setVideoOff(false);
          publishHomeownerVideoState(true).catch(() => undefined);
          watchConferenceState();
        }
      } catch (error) {
        console.error('Consult join error:', error);
        pushDebugLog(`Join error: ${(error as Error).message}`);
        if (mounted) {
          const message = (error as Error).message;
          setStatus(`Failed to join: ${message}`);
          setBlockingError(message);
          setEndReason('ended');
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
    try {
      const nextVideoOff = !isVideoOff;
      if (nextVideoOff) {
        const track = localStreamRef.current?.getVideoTracks?.()[0];
        if (!track) return;
        track.enabled = false;
        sessionRef.current?.stopOutboundVideo?.();
        publishHomeownerVideoState(false).catch(() => undefined);
        pushDebugLog('Local video track disabled from button');
      } else {
        await restoreBackCameraVideoTrack();
        sessionRef.current?.restoreOutboundVideo?.();
        publishHomeownerVideoState(true).catch(() => undefined);
        pushDebugLog('Local video track re-enabled from button using back camera');
      }
      setVideoOff(nextVideoOff);
    } catch (error) {
      console.error('Video toggle error:', error);
      setStatus(`Video toggle failed: ${(error as Error).message}`);
    }
  };

  const clearSignatureCanvas = useCallback(() => {
    signatureHasStrokeRef.current = false;
    signatureLastPointRef.current = null;
    signaturePointerIdRef.current = null;
    setHasSignature(false);
    setSignatureError('');
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const ensureSignatureCanvas = useCallback(() => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const bounds = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(bounds.width));
    const height = Math.max(1, Math.round(bounds.height));
    const dpr = window.devicePixelRatio || 1;
    const nextWidth = Math.round(width * dpr);
    const nextHeight = Math.round(height * dpr);
    if (canvas.width === nextWidth && canvas.height === nextHeight) return;
    canvas.width = nextWidth;
    canvas.height = nextHeight;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.scale(dpr, dpr);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = 2.5;
    context.strokeStyle = '#111827';
    context.fillStyle = '#111827';
    context.clearRect(0, 0, width, height);
    signatureHasStrokeRef.current = false;
    setHasSignature(false);
  }, []);

  const signaturePointFromEvent = (
    event: React.PointerEvent<HTMLCanvasElement>
  ) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return null;
    const bounds = canvas.getBoundingClientRect();
    return {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top
    };
  };

  const handleSignaturePointerDown = (
    event: React.PointerEvent<HTMLCanvasElement>
  ) => {
    ensureSignatureCanvas();
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const point = signaturePointFromEvent(event);
    if (!point) return;
    signaturePointerIdRef.current = event.pointerId;
    signatureLastPointRef.current = point;
    canvas.setPointerCapture(event.pointerId);
    context.beginPath();
    context.arc(point.x, point.y, 1.25, 0, Math.PI * 2);
    context.fill();
    signatureHasStrokeRef.current = true;
    setHasSignature(true);
    setSignatureError('');
  };

  const handleSignaturePointerMove = (
    event: React.PointerEvent<HTMLCanvasElement>
  ) => {
    if (signaturePointerIdRef.current !== event.pointerId) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const nextPoint = signaturePointFromEvent(event);
    const previousPoint = signatureLastPointRef.current;
    if (!nextPoint || !previousPoint) return;
    context.beginPath();
    context.moveTo(previousPoint.x, previousPoint.y);
    context.lineTo(nextPoint.x, nextPoint.y);
    context.stroke();
    signatureLastPointRef.current = nextPoint;
    signatureHasStrokeRef.current = true;
    setHasSignature(true);
  };

  const handleSignaturePointerEnd = (
    event: React.PointerEvent<HTMLCanvasElement>
  ) => {
    if (signaturePointerIdRef.current !== event.pointerId) return;
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      canvas.releasePointerCapture(event.pointerId);
    }
    signaturePointerIdRef.current = null;
    signatureLastPointRef.current = null;
  };

  const acceptQuote = useCallback(async (signatureDataUrl: string) => {
    try {
      setSubmittingAcceptance(true);
      const acceptedAt = new Date().toISOString();
      const hasTerms = Boolean(providerProfile.termsAndConditionsUrl);
      if (conferenceIdRef.current) {
        await fetch('/api/signalwire/conference-state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conferenceId: conferenceIdRef.current,
            mode: 'quote',
            metaPatch: {
              quote_accepted: true,
              quote_accepted_at: acceptedAt,
              quote_terms_reviewed: hasTerms ? hasReviewedTerms : false,
              quote_terms_url: providerProfile.termsAndConditionsUrl || null,
              quote_signature_captured: true,
              quote_signature_captured_at: acceptedAt
            }
          })
        }).catch(() => undefined);
      }

      const quoteRef = await resolveQuoteDocRef();
      if (quoteRef) {
        await updateDoc(quoteRef, {
          quoteAccepted: true,
          quoteAcceptedAt: acceptedAt,
          quoteTermsReviewed: hasTerms ? hasReviewedTerms : false,
          quoteTermsUrl: providerProfile.termsAndConditionsUrl || '',
          quoteSignatureCaptured: true,
          quoteSignatureCapturedAt: acceptedAt,
          quoteSignatureDataUrl: signatureDataUrl,
          quoteSignature: {
            format: 'image/png',
            dataUrl: signatureDataUrl,
            signedAt: acceptedAt,
            source: 'consult-signature-pad-v1'
          }
        }).catch(() => undefined);
      }

      setAcceptModalOpen(false);
      setQuoteAccepted(true);
      setShowAcceptedScreen(true);
      setStatus('Congratulations on Accepting Your Quote!');
      pushDebugLog('Quote accepted by homeowner');
    } catch (error) {
      console.error('Accept quote error:', error);
      pushDebugLog(
        `Accept quote error: ${(error as Error).message}`
      );
    } finally {
      setSubmittingAcceptance(false);
    }
  }, [
    hasReviewedTerms,
    providerProfile.termsAndConditionsUrl,
    pushDebugLog,
    resolveQuoteDocRef
  ]);

  const openAcceptModal = () => {
    setAcceptModalOpen(true);
    setHasReviewedTerms(false);
    clearSignatureCanvas();
    setSignatureError('');
  };

  const submitAcceptedQuote = async () => {
    const hasTerms = Boolean(providerProfile.termsAndConditionsUrl);
    if (hasTerms && !hasReviewedTerms) {
      setSignatureError('Please review and confirm the terms and conditions first.');
      return;
    }
    if (!signatureHasStrokeRef.current) {
      setSignatureError('Please sign before accepting your quote.');
      return;
    }
    const canvas = signatureCanvasRef.current;
    if (!canvas) {
      setSignatureError('Signature pad is unavailable. Please try again.');
      return;
    }
    const signatureDataUrl = canvas.toDataURL('image/png');
    await acceptQuote(signatureDataUrl);
  };

  useEffect(() => {
    if (!isAcceptModalOpen) return;
    ensureSignatureCanvas();
    const handleResize = () => ensureSignatureCanvas();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [ensureSignatureCanvas, isAcceptModalOpen]);

  const endCall = async () => {
    if (isQuoteAccepted) {
      publishHomeownerVideoState(false).catch(() => undefined);
      const closedAt = new Date().toISOString();
      if (conferenceIdRef.current) {
        await fetch('/api/signalwire/conference-state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conferenceId: conferenceIdRef.current,
            mode: 'quote',
            metaPatch: {
              quote_accepted: true,
              quote_session_closed: true,
              quote_call_closed_at: closedAt
            }
          })
        }).catch(() => undefined);
      }
      const quoteRef = await resolveQuoteDocRef();
      if (quoteRef) {
        await updateDoc(quoteRef, {
          quoteAccepted: true,
          quoteSessionClosed: true,
          quoteSessionClosedAt: closedAt
        }).catch(() => undefined);
      }
      await endConferenceEverywhere();
      await concludeAcceptedQuoteSession();
      return;
    }

    localEndRequestedRef.current = true;
    publishHomeownerVideoState(false).catch(() => undefined);
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
      <div
        style={{
          position: 'fixed',
          inset: 0,
          overflow: 'hidden',
          background: '#000',
          zIndex:
            viewport.isDimensions && viewport.isSm
              ? 30
              : 10
        }}
      >
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
                {showAcceptedScreen && submittedQuote ? (
                  <div
                    style={{
                      position: 'relative',
                      minHeight: '100%',
                      background: '#ffffff',
                      color: '#0f172a',
                      borderRadius: 16,
                      padding: '22px 14px 28px',
                      overflow: 'hidden'
                    }}
                  >
                    {[...Array(20)].map((_, index) => (
                      <span
                        key={`confetti-${index}`}
                        style={{
                          ...acceptedConfettiStyle(index),
                          animationDelay: `${(index % 6) * 0.18}s`
                        }}
                      />
                    ))}
                    <div
                      style={{
                        position: 'relative',
                        zIndex: 1,
                        maxWidth: 560,
                        margin: '0 auto'
                      }}
                    >
                      <div
                        style={{
                          textAlign: 'center',
                          fontWeight: 800,
                          fontSize: 28,
                          lineHeight: 1.18,
                          color: '#14532d'
                        }}
                      >
                        Congrats on accepting your quote with {providerProfile.businessName || 'your provider'}!
                      </div>
                      {providerProfile.logoUrl ? (
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16, marginBottom: 10 }}>
                          <img
                            src={providerProfile.logoUrl}
                            alt={`${providerProfile.businessName || 'Provider'} logo`}
                            style={{
                              maxHeight: 78,
                              maxWidth: 220,
                              width: 'auto',
                              objectFit: 'contain'
                            }}
                          />
                        </div>
                      ) : null}
                      <div
                        style={{
                          marginTop: 14,
                          background: '#f8fafc',
                          border: '1px solid #dbe7f4',
                          borderRadius: 14,
                          padding: '14px 12px'
                        }}
                      >
                        <div style={{ marginBottom: 10, fontWeight: 700, fontSize: 17, color: '#0f172a' }}>Your Quote</div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                          <colgroup>
                            <col style={{ width: '30%' }} />
                            <col style={{ width: '42%' }} />
                            <col style={{ width: '28%' }} />
                          </colgroup>
                          <thead>
                            <tr>
                              <th style={whiteQuoteHeaderCellStyle}>Item</th>
                              <th style={whiteQuoteHeaderCellStyle}>Description</th>
                              <th style={whiteQuoteHeaderCellStyle}>Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            {submittedQuote.rows.map((row, index) => (
                              <tr key={`${row.item}-${row.description}-${index}`} style={{ borderTop: '1px solid #dbe7f4' }}>
                                <td style={quoteCellStyle}>
                                  <div style={whiteQuoteDisplayCellStyle}>{row.item || '-'}</div>
                                </td>
                                <td style={quoteCellStyle}>
                                  <div style={whiteQuoteDisplayCellStyle}>{row.description || '-'}</div>
                                </td>
                                <td style={quoteCellStyle}>
                                  <div style={whiteQuoteDisplayCellStyle}>${row.price}</div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div style={{ marginTop: 12, color: '#0f172a', fontSize: 14, fontWeight: 700 }}>
                          Total: ${submittedQuote.totalPrice.toFixed(2)}
                        </div>
                      </div>
                      <div
                        style={{
                          textAlign: 'center',
                          marginTop: 20,
                          fontSize: 20,
                          fontWeight: 800,
                          color: '#0f172a'
                        }}
                      >
                        Thanks for using TakeShape!
                      </div>
                    </div>
                  </div>
                ) : submittedQuote ? (
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
            {isQuoteMode && submittedQuote && !isQuoteAccepted && isAcceptModalOpen && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 22,
                  background: 'rgba(2, 6, 23, 0.82)',
                  padding: '10px 8px 84px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div
                  style={{
                    width: '100%',
                    maxWidth: 760,
                    maxHeight: providerProfile.termsAndConditionsUrl ? '92%' : 420,
                    overflowY: 'auto',
                    borderRadius: 16,
                    background: '#ffffff',
                    color: '#111827',
                    border: '1px solid #dbe5f2',
                    padding: '14px 12px 16px',
                    boxShadow: '0 18px 40px rgba(2, 6, 23, 0.42)'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 10
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 17 }}>
                      Review & Sign to Accept
                    </div>
                    <button
                      onClick={() => setAcceptModalOpen(false)}
                      style={{
                        border: 'none',
                        background: '#f1f5f9',
                        color: '#0f172a',
                        borderRadius: 999,
                        padding: '6px 10px',
                        fontWeight: 600,
                        fontSize: 12
                      }}
                    >
                      Close
                    </button>
                  </div>
                  {providerProfile.termsAndConditionsUrl && (
                    <div
                      style={{
                        border: '1px solid #dbe5f2',
                        borderRadius: 12,
                        marginBottom: 12
                      }}
                    >
                      <div
                        style={{
                          padding: '8px 10px',
                          background: '#f8fafc',
                          borderBottom: '1px solid #dbe5f2',
                          fontSize: 13,
                          fontWeight: 700
                        }}
                      >
                        Terms & Conditions
                      </div>
                      <div
                        style={{
                          padding: '12px 10px',
                          background: '#fff',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 10
                        }}
                      >
                        <div style={{ fontSize: 12, color: '#475569' }}>
                          Open the provider terms in a new page to review them.
                        </div>
                        <a
                          href={providerProfile.termsAndConditionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            height: 40,
                            borderRadius: 10,
                            textDecoration: 'none',
                            background: '#e2e8f0',
                            color: '#0f172a',
                            fontWeight: 700,
                            fontSize: 13
                          }}
                        >
                          Open Terms & Conditions
                        </a>
                      </div>
                      <div style={{ padding: 10, background: '#f8fafc' }}>
                        <button
                          onClick={() => {
                            setHasReviewedTerms(true);
                            setSignatureError('');
                          }}
                          style={{
                            width: '100%',
                            height: 40,
                            borderRadius: 10,
                            border: 'none',
                            background: hasReviewedTerms ? '#16a34a' : PRIMARY_COLOR_HEX,
                            color: '#fff',
                            fontWeight: 700
                          }}
                        >
                          {hasReviewedTerms ? 'Terms Accepted' : 'Accept Terms & Conditions'}
                        </button>
                      </div>
                    </div>
                  )}
                  <div
                    style={{
                      border: '1px solid #dbe5f2',
                      borderRadius: 12,
                      padding: 10
                    }}
                  >
                    <div style={{ fontSize: 13, color: '#334155', marginBottom: 8 }}>
                      Homeowner Signature
                    </div>
                    <div
                      style={{
                        border: '1px solid #cbd5e1',
                        borderRadius: 10,
                        overflow: 'hidden',
                        background: '#ffffff'
                      }}
                    >
                      <canvas
                        ref={signatureCanvasRef}
                        onPointerDown={handleSignaturePointerDown}
                        onPointerMove={handleSignaturePointerMove}
                        onPointerUp={handleSignaturePointerEnd}
                        onPointerCancel={handleSignaturePointerEnd}
                        style={{
                          width: '100%',
                          height: providerProfile.termsAndConditionsUrl
                            ? 'clamp(120px, 20vh, 160px)'
                            : 220,
                          touchAction: 'none',
                          display: 'block',
                          cursor: 'crosshair'
                        }}
                      />
                    </div>
                    <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                      <button
                        onClick={clearSignatureCanvas}
                        style={{
                          flex: 1,
                          height: 40,
                          borderRadius: 10,
                          border: '1px solid #cbd5e1',
                          background: '#f8fafc',
                          color: '#0f172a',
                          fontWeight: 700
                        }}
                      >
                        Clear Signature
                      </button>
                      <button
                        onClick={submitAcceptedQuote}
                        disabled={isSubmittingAcceptance || (providerProfile.termsAndConditionsUrl ? !hasReviewedTerms : false) || !hasSignature}
                        style={{
                          flex: 2,
                          height: 40,
                          borderRadius: 10,
                          border: 'none',
                          background:
                            isSubmittingAcceptance
                              ? '#16a34a'
                              : ((providerProfile.termsAndConditionsUrl ? !hasReviewedTerms : false) || !hasSignature)
                              ? '#94a3b8'
                              : PRIMARY_COLOR_HEX,
                          color: '#fff',
                          fontWeight: 700
                        }}
                      >
                        {isSubmittingAcceptance ? 'Submitting...' : 'Submit Signature'}
                      </button>
                    </div>
                    {signatureError && (
                      <div style={{ marginTop: 8, fontSize: 12, color: '#b91c1c', fontWeight: 600 }}>
                        {signatureError}
                      </div>
                    )}
                  </div>
                </div>
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
            {!isQuoteSessionClosed && !showAcceptedScreen && (
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
              {isQuoteMode && submittedQuote && !isQuoteAccepted && (
                <button
                  onClick={openAcceptModal}
                  style={{
                    height: 48,
                    borderRadius: 999,
                    border: 'none',
                    padding: '0 18px',
                    background: '#16a34a',
                    color: '#fff',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  Accept Quote
                </button>
              )}
              {isQuoteAccepted && isQuoteMode && !showAcceptedScreen ? (
                <button
                  onClick={endCall}
                  style={{
                    height: 48,
                    borderRadius: 999,
                    border: 'none',
                    padding: '0 18px',
                    background: '#e53935',
                    color: '#fff',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  End Call
                </button>
              ) : (
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
              )}
              </div>
            )}
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
        @keyframes consult-confetti-fall {
          0% {
            transform: translate3d(0, -30px, 0) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: 0.92;
          }
          100% {
            transform: translate3d(0, 540px, 0) rotate(340deg);
            opacity: 0;
          }
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

const whiteQuoteHeaderCellStyle: React.CSSProperties = {
  textAlign: 'left',
  color: '#334155',
  fontSize: 12,
  fontWeight: 700,
  padding: '8px 4px'
};

const acceptedConfettiPalette = ['#f97316', '#f43f5e', '#22c55e', '#3b82f6', '#eab308', '#14b8a6'];

const acceptedConfettiStyle = (index: number): React.CSSProperties => ({
  position: 'absolute',
  left: `${5 + ((index * 4.9) % 90)}%`,
  top: -28 - (index % 4) * 16,
  width: 8 + (index % 4) * 3,
  height: 14 + (index % 3) * 4,
  borderRadius: 2,
  background: acceptedConfettiPalette[index % acceptedConfettiPalette.length],
  opacity: 0.9,
  transform: `rotate(${(index * 37) % 360}deg)`,
  animation: `consult-confetti-fall ${2.8 + (index % 4) * 0.42}s linear infinite`
});

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

const whiteQuoteDisplayCellStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #dbe7f4',
  borderRadius: 10,
  background: '#ffffff',
  color: '#0f172a',
  padding: '8px 10px',
  fontSize: 13,
  minHeight: 34,
  display: 'flex',
  alignItems: 'center'
};

export default ConsultPage;
