'use client';

import firebase from '@/lib/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { getDownloadURL, getStorage, ref as storageRef } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PRIMARY_COLOR_HEX } from '@/constants/brand-color';
import { useGoogleAddressAutocomplete } from '@/hooks/address/google-autocomplete';
import { MapsLoaded } from '@/components/maps/loaded';

type QuotePricingRow = {
  item: string;
  description: string;
  price: number;
};

type QuoteCard = {
  id: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  thumbnailStatus: 'pending' | 'ready' | 'failed' | null;
  videoStatus: 'ready' | 'storing' | 'missing' | 'error';
  videoMessage: string;
  recordingId: string | null;
  rows: QuotePricingRow[];
  totalPrice: number;
  createdAtLabel: string;
  homeownerName: string | null;
  homeownerEmail: string | null;
  homeownerPhone: string | null;
  homeownerAddress: string | null;
  isSigned: boolean;
  signatureDataUrl: string | null;
  signatureSignedAtLabel: string | null;
};

const resolveDisplayDate = (raw: any) => {
  const seconds = Number(raw?.seconds);
  if (Number.isFinite(seconds) && seconds > 0) {
    return new Date(seconds * 1000).toLocaleString();
  }
  const parsed = new Date(String(raw || ''));
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleString();
  }
  return 'Unknown date';
};

const normalizeOptionalField = (raw: any): string | null => {
  const value = String(raw || '').trim();
  return value ? value : null;
};

const escapeHtml = (raw: string) =>
  raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const extractLegacyVideoUrl = (rawVideoEstimates: any): string | null => {
  if (!Array.isArray(rawVideoEstimates)) return null;
  for (const estimate of rawVideoEstimates) {
    const value = normalizeOptionalField(estimate?.value);
    if (value) return value;
    const url = normalizeOptionalField(estimate?.url);
    if (url) return url;
  }
  return null;
};

const extractLegacyRecordingId = (rawVideoEstimates: any): string | null => {
  if (!Array.isArray(rawVideoEstimates)) return null;
  for (const estimate of rawVideoEstimates) {
    const recordingId = normalizeOptionalField(
      estimate?.signalwireRecordingId || estimate?.recordingId
    );
    if (recordingId) return recordingId;
  }
  return null;
};

type TQuoteAddressFieldProps = {
  value: string;
  onChange(value: string): void;
};

const QuoteAddressField: React.FC<TQuoteAddressFieldProps> = ({
  value,
  onChange
}) => {
  const addressInputRef = useRef<HTMLInputElement | null>(null);

  useGoogleAddressAutocomplete(addressInputRef, {
    onPlaceChange: (place) => {
      const formattedAddress = String(place.formatted_address || '').trim();
      if (!formattedAddress) return;
      onChange(formattedAddress);
    }
  });

  return (
    <input
      ref={addressInputRef}
      placeholder="Property Address (Optional)"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
        }
      }}
      autoComplete="off"
      spellCheck={false}
      style={modalInputStyle}
    />
  );
};

export default function QuotesPage() {
  const router = useRouter();
  const auth = useMemo(() => getAuth(firebase), []);
  const firestore = useMemo(() => getFirestore(firebase), []);
  const storage = useMemo(() => getStorage(firebase), []);
  const [isCheckingAuth, setCheckingAuth] = useState(true);
  const [isPainterUser, setPainterUser] = useState(false);
  const [isLoadingQuotes, setLoadingQuotes] = useState(false);
  const [quotes, setQuotes] = useState<QuoteCard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activePainterId, setActivePainterId] = useState<string | null>(null);
  const [isRefreshingVideos, setRefreshingVideos] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [isSavingCustomerInfo, setSavingCustomerInfo] = useState(false);
  const [customerInfoError, setCustomerInfoError] = useState<string | null>(null);
  const [isMobileLayout, setMobileLayout] = useState(false);
  const videoRetryAttemptedRef = useRef<Set<string>>(new Set());
  const thumbnailAttemptedRef = useRef<Set<string>>(new Set());
  const thumbnailInFlightRef = useRef<Set<string>>(new Set());
  const [customerInfoForm, setCustomerInfoForm] = useState({
    homeownerName: '',
    homeownerEmail: '',
    homeownerPhone: '',
    homeownerAddress: ''
  });

  const captureThumbnailFromVideo = useCallback(async (
    videoUrl: string
  ): Promise<{ dataUrl: string; second: number } | null> => {
    if (!videoUrl || typeof window === 'undefined') return null;

    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.src = videoUrl;

    const waitForMetadata = new Promise<void>((resolve, reject) => {
      const onLoadedMetadata = () => {
        cleanup();
        resolve();
      };
      const onError = () => {
        cleanup();
        reject(new Error('Failed to load video metadata'));
      };
      const cleanup = () => {
        video.removeEventListener('loadedmetadata', onLoadedMetadata);
        video.removeEventListener('error', onError);
      };
      video.addEventListener('loadedmetadata', onLoadedMetadata);
      video.addEventListener('error', onError);
    });

    try {
      await waitForMetadata;
    } catch {
      return null;
    }

    const duration = Number(video.duration);
    const candidateSeconds = [
      1,
      2,
      4,
      6,
      10,
      14,
      20,
      duration * 0.2,
      duration * 0.35,
      duration * 0.5
    ]
      .filter((value) => Number.isFinite(value))
      .map((value) => Math.max(0.2, Math.min(Number(value), Math.max(0.2, duration - 0.2))))
      .filter((value, index, list) => list.findIndex((entry) => Math.abs(entry - value) < 0.2) === index);

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return null;

    let fallbackFrame: { dataUrl: string; second: number } | null = null;

    const seekTo = async (second: number) => {
      await new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(() => {
          cleanup();
          reject(new Error('Video seek timed out'));
        }, 4500);
        const onSeeked = () => {
          cleanup();
          resolve();
        };
        const onError = () => {
          cleanup();
          reject(new Error('Video seek failed'));
        };
        const cleanup = () => {
          window.clearTimeout(timeout);
          video.removeEventListener('seeked', onSeeked);
          video.removeEventListener('error', onError);
        };
        video.addEventListener('seeked', onSeeked);
        video.addEventListener('error', onError);
        video.currentTime = second;
      });
    };

    const scoreFrame = () => {
      const width = Math.max(1, Math.min(video.videoWidth || 0, 960));
      const height = Math.max(1, Math.round(width / Math.max(1, (video.videoWidth || 1) / Math.max(1, video.videoHeight || 1))));
      canvas.width = width;
      canvas.height = height;
      context.drawImage(video, 0, 0, width, height);

      const frame = context.getImageData(0, 0, width, height).data;
      const stride = 24;
      let samples = 0;
      let luminanceSum = 0;
      let luminanceSquaredSum = 0;

      for (let index = 0; index < frame.length; index += stride) {
        const red = frame[index];
        const green = frame[index + 1];
        const blue = frame[index + 2];
        const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
        luminanceSum += luminance;
        luminanceSquaredSum += luminance * luminance;
        samples += 1;
      }

      if (!samples) {
        return { acceptable: false, dataUrl: null as string | null };
      }

      const averageLuminance = luminanceSum / samples;
      const variance = Math.max(
        0,
        luminanceSquaredSum / samples - averageLuminance * averageLuminance
      );

      let dataUrl: string | null = null;
      try {
        dataUrl = canvas.toDataURL('image/jpeg', 0.78);
      } catch {
        dataUrl = null;
      }

      const acceptable = averageLuminance >= 24 && variance >= 120;
      return { acceptable, dataUrl };
    };

    for (const second of candidateSeconds) {
      try {
        await seekTo(second);
        const scored = scoreFrame();
        if (!scored.dataUrl) continue;
        if (!fallbackFrame) {
          fallbackFrame = { dataUrl: scored.dataUrl, second };
        }
        if (scored.acceptable) {
          return { dataUrl: scored.dataUrl, second };
        }
      } catch {
        continue;
      }
    }

    return fallbackFrame;
  }, []);

  const handleDownloadVideo = useCallback(async (
    quote: QuoteCard
  ) => {
    if (!quote.videoUrl) return;

    try {
      const response = await fetch(quote.videoUrl);
      if (!response.ok) {
        throw new Error('Download request failed');
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `quote-video-${quote.id}.webm`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (downloadError) {
      console.error('Failed to download video:', downloadError);
      setError('Failed to download video.');
    }
  }, []);

  const handleDownloadQuoteSummary = useCallback((quote: QuoteCard) => {
    const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=980,height=900');
    if (!printWindow) {
      setError('Unable to open print window. Please allow pop-ups and try again.');
      return;
    }

    const rowsMarkup = quote.rows.map((row) => `
      <tr>
        <td>${escapeHtml(row.item || '-')}</td>
        <td>${escapeHtml(row.description || '-')}</td>
        <td>$${row.price.toFixed(2)}</td>
      </tr>
    `).join('');

    const signatureMarkup = quote.signatureDataUrl
      ? `
        <div class="section-title">Signature</div>
        <div class="signature-shell">
          <img src="${quote.signatureDataUrl}" alt="Homeowner signature" />
        </div>
        <div class="muted">Signed at: ${escapeHtml(quote.signatureSignedAtLabel || 'Unknown')}</div>
      `
      : '<div class="muted">No signature on file.</div>';

    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Quote Summary ${escapeHtml(quote.id)}</title>
          <style>
            @page { size: A4; margin: 24px; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
              color: #0f172a;
              margin: 0;
              padding: 0;
            }
            .heading { font-size: 24px; font-weight: 800; margin-bottom: 8px; }
            .meta { color: #475569; font-size: 12px; margin-bottom: 14px; }
            .section-title { font-size: 14px; font-weight: 700; margin: 14px 0 8px; }
            table { width: 100%; border-collapse: collapse; table-layout: fixed; }
            th, td {
              border: 1px solid #dbe3ef;
              padding: 8px 10px;
              font-size: 12px;
              vertical-align: top;
              word-break: break-word;
            }
            th { background: #f8fafc; text-align: left; color: #334155; font-weight: 700; }
            .total { text-align: right; margin-top: 8px; font-weight: 700; }
            .homeowner-grid { display: grid; grid-template-columns: 130px 1fr; row-gap: 6px; column-gap: 8px; font-size: 12px; }
            .label { color: #64748b; font-weight: 700; }
            .signature-shell {
              border: 1px solid #dbe3ef;
              border-radius: 8px;
              min-height: 90px;
              padding: 8px;
              display: flex;
              align-items: center;
            }
            .signature-shell img {
              max-width: 100%;
              max-height: 130px;
              object-fit: contain;
            }
            .muted { color: #64748b; font-size: 12px; margin-top: 8px; }
          </style>
        </head>
        <body>
          <div class="heading">TakeShape Quote Summary</div>
          <div class="meta">Quote ID: ${escapeHtml(quote.id)} | Created: ${escapeHtml(quote.createdAtLabel)}</div>

          <div class="section-title">Line Items</div>
          <table>
            <thead>
              <tr><th style="width:30%">Item</th><th style="width:42%">Description</th><th style="width:28%">Price</th></tr>
            </thead>
            <tbody>${rowsMarkup}</tbody>
          </table>
          <div class="total">Total: $${quote.totalPrice.toFixed(2)}</div>

          <div class="section-title">Homeowner Information</div>
          <div class="homeowner-grid">
            <div class="label">Name</div><div>${escapeHtml(quote.homeownerName || 'Not provided')}</div>
            <div class="label">Email</div><div>${escapeHtml(quote.homeownerEmail || 'Not provided')}</div>
            <div class="label">Phone</div><div>${escapeHtml(quote.homeownerPhone || 'Not provided')}</div>
            <div class="label">Address</div><div>${escapeHtml(quote.homeownerAddress || 'Not provided')}</div>
          </div>

          ${signatureMarkup}
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    window.setTimeout(() => {
      printWindow.print();
    }, 200);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(max-width: 720px)');
    const syncLayout = () => setMobileLayout(mediaQuery.matches);
    syncLayout();
    mediaQuery.addEventListener('change', syncLayout);
    return () => {
      mediaQuery.removeEventListener('change', syncLayout);
    };
  }, []);

  const loadQuotes = useCallback(async (
    painterId: string,
    options: { skipAutoFinalize?: boolean } = {}
  ) => {
    setLoadingQuotes(true);
    try {
      const quotesQuery = query(
        collection(firestore, 'painters', painterId, 'quotes'),
        orderBy('createdAt', 'desc'),
        limit(30)
      );
      const snapshot = await getDocs(quotesQuery);

      const cards = await Promise.all(
        snapshot.docs.map(async (quoteDoc) => {
          const data = quoteDoc.data() as Record<string, any>;
          const pricing = data.pricing || {};
          const homeownerName = normalizeOptionalField(data.homeownerName);
          const homeownerEmail = normalizeOptionalField(data.homeownerEmail);
          const homeownerPhone = normalizeOptionalField(data.homeownerPhone);
          const homeownerAddress = normalizeOptionalField(data.homeownerAddress);
          const signatureDataUrl = normalizeOptionalField(
            data?.quoteSignature?.dataUrl || data?.quoteSignatureDataUrl
          );
          const signatureSignedAtRaw = data?.quoteSignature?.signedAt || data?.quoteSignatureCapturedAt;
          const signatureSignedAtLabel = signatureSignedAtRaw
            ? resolveDisplayDate(signatureSignedAtRaw)
            : null;
          const isSigned = Boolean(
            data?.quoteSignatureCaptured ||
            data?.quoteSignature ||
            signatureDataUrl
          );
          const rowsRaw = Array.isArray(pricing.rows) ? pricing.rows : [];
          const rows: QuotePricingRow[] = rowsRaw.map((row: any) => ({
            item: String(row?.item || ''),
            description: String(row?.description || ''),
            price: Number(row?.price) || 0
          }));

          const videoEstimate = (data.videoEstimate || {}) as Record<string, any>;
          const videoStatusRaw = String(videoEstimate.status || '').toLowerCase();
          const legacyVideoUrl = extractLegacyVideoUrl(data.videoEstimates);
          const recordingId = String(
            videoEstimate.recordingId ||
            data.signalwireRecordingId ||
            extractLegacyRecordingId(data.videoEstimates) ||
            ''
          ).trim() || null;
          const storedVideoValue = String(videoEstimate.url || '').trim() || null;
          const storedThumbnailValue = String(
            videoEstimate.thumbnailUrl || ''
          ).trim() || null;
          const thumbnailStatusRaw = String(
            videoEstimate.thumbnailStatus || ''
          ).trim().toLowerCase();
          const thumbnailStatus: QuoteCard['thumbnailStatus'] =
            thumbnailStatusRaw === 'pending' ||
            thumbnailStatusRaw === 'ready' ||
            thumbnailStatusRaw === 'failed'
              ? (thumbnailStatusRaw as QuoteCard['thumbnailStatus'])
              : null;
          const resolvedStoredVideoValue = storedVideoValue || legacyVideoUrl;

          let videoUrl: string | null = null;
          let thumbnailUrl: string | null = null;
          if (resolvedStoredVideoValue) {
            if (/^https?:\/\//i.test(resolvedStoredVideoValue)) {
              videoUrl = resolvedStoredVideoValue;
            } else {
              try {
                videoUrl = await getDownloadURL(storageRef(storage, resolvedStoredVideoValue));
              } catch {
                videoUrl = null;
              }
            }
          }
          if (storedThumbnailValue) {
            if (
              /^data:image\//i.test(storedThumbnailValue) ||
              /^https?:\/\//i.test(storedThumbnailValue)
            ) {
              thumbnailUrl = storedThumbnailValue;
            } else {
              try {
                thumbnailUrl = await getDownloadURL(
                  storageRef(storage, storedThumbnailValue)
                );
              } catch {
                thumbnailUrl = null;
              }
            }
          }

          const videoStatus: QuoteCard['videoStatus'] = videoUrl
            ? 'ready'
            : videoStatusRaw === 'storing'
              ? 'storing'
              : videoStatusRaw === 'error'
                ? 'error'
                : 'missing';
          const videoMessage = videoUrl
            ? ''
            : videoStatus === 'storing'
              ? 'Video is being stored'
              : videoStatus === 'error'
                ? 'Video unavailable right now'
                : 'Video not found';

          return {
            id: quoteDoc.id,
            videoUrl,
            thumbnailUrl,
            thumbnailStatus,
            videoStatus,
            videoMessage,
            recordingId,
            rows,
            totalPrice: Number(pricing.totalPrice) || 0,
            createdAtLabel: resolveDisplayDate(data.createdAt || pricing.updatedAt || ''),
            homeownerName,
            homeownerEmail,
            homeownerPhone,
            homeownerAddress,
            isSigned,
            signatureDataUrl,
            signatureSignedAtLabel
          } as QuoteCard;
        })
      );

      setQuotes(cards);

      if (!options.skipAutoFinalize) {
        const cardsNeedingVideoRefresh = cards.filter(
          (card) => !card.videoUrl && !!card.recordingId
        );

        if (cardsNeedingVideoRefresh.length > 0) {
          setRefreshingVideos(true);
          await Promise.all(
            cardsNeedingVideoRefresh.map((card) =>
              fetch('/api/quotes/finalize-recording', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  painterDocId: painterId,
                  quoteId: card.id,
                  recordingId: card.recordingId,
                  waitMs: 0
                })
              }).catch(() => null)
            )
          );
          await loadQuotes(painterId, { skipAutoFinalize: true });
        }
      }
    } catch (loadError) {
      console.error('Failed to load quotes:', loadError);
      setError('Failed to load quotes.');
    } finally {
      setLoadingQuotes(false);
      setRefreshingVideos(false);
    }
  }, [firestore, storage]);

  const openCustomerInfoModal = useCallback((quote: QuoteCard) => {
    setEditingQuoteId(quote.id);
    setCustomerInfoError(null);
    setCustomerInfoForm({
      homeownerName: quote.homeownerName || '',
      homeownerEmail: quote.homeownerEmail || '',
      homeownerPhone: quote.homeownerPhone || '',
      homeownerAddress: quote.homeownerAddress || ''
    });
  }, []);

  const closeCustomerInfoModal = useCallback(() => {
    if (isSavingCustomerInfo) return;
    setEditingQuoteId(null);
    setCustomerInfoError(null);
  }, [isSavingCustomerInfo]);

  const refreshQuoteVideo = useCallback(async (quote: QuoteCard) => {
    if (!activePainterId || !quote.recordingId) return;
    if (videoRetryAttemptedRef.current.has(quote.id)) return;

    videoRetryAttemptedRef.current.add(quote.id);
    try {
      setRefreshingVideos(true);
      await fetch('/api/quotes/finalize-recording', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          painterDocId: activePainterId,
          quoteId: quote.id,
          recordingId: quote.recordingId,
          waitMs: 0
        })
      });
      await loadQuotes(activePainterId, { skipAutoFinalize: true });
    } catch (refreshError) {
      console.error('Video refresh failed:', refreshError);
    } finally {
      setRefreshingVideos(false);
    }
  }, [activePainterId, loadQuotes]);

  useEffect(() => {
    if (!activePainterId) return;

    const candidates = quotes.filter((quote) =>
      !!quote.videoUrl &&
      !quote.thumbnailUrl &&
      quote.thumbnailStatus === 'pending' &&
      !thumbnailAttemptedRef.current.has(quote.id) &&
      !thumbnailInFlightRef.current.has(quote.id)
    );

    if (!candidates.length) return;

    let cancelled = false;

    const run = async () => {
      for (const quote of candidates) {
        if (cancelled || !quote.videoUrl) break;
        thumbnailInFlightRef.current.add(quote.id);
        thumbnailAttemptedRef.current.add(quote.id);

        try {
          const capturedThumbnail = await captureThumbnailFromVideo(
            quote.videoUrl
          );

          if (!capturedThumbnail) {
            await updateDoc(
              doc(
                firestore,
                'painters',
                activePainterId,
                'quotes',
                quote.id
              ),
              {
                'videoEstimate.thumbnailStatus': 'failed',
                'videoEstimate.thumbnailCapturedAt': new Date().toISOString(),
                updatedAt: serverTimestamp()
              }
            );
            continue;
          }

          await updateDoc(
            doc(
              firestore,
              'painters',
              activePainterId,
              'quotes',
              quote.id
            ),
            {
              'videoEstimate.thumbnailUrl': capturedThumbnail.dataUrl,
              'videoEstimate.thumbnailStatus': 'ready',
              'videoEstimate.thumbnailCapturedAt': new Date().toISOString(),
              'videoEstimate.thumbnailSourceSecond': Number(
                capturedThumbnail.second.toFixed(2)
              ),
              updatedAt: serverTimestamp()
            }
          );

          if (cancelled) continue;
          setQuotes((previousQuotes) =>
            previousQuotes.map((previousQuote) =>
              previousQuote.id === quote.id
                ? {
                  ...previousQuote,
                  thumbnailUrl: capturedThumbnail.dataUrl,
                  thumbnailStatus: 'ready'
                }
                : previousQuote
            )
          );
        } catch {
          try {
            await updateDoc(
              doc(
                firestore,
                'painters',
                activePainterId,
                'quotes',
                quote.id
              ),
              {
                'videoEstimate.thumbnailStatus': 'failed',
                'videoEstimate.thumbnailCapturedAt': new Date().toISOString(),
                updatedAt: serverTimestamp()
              }
            );
          } catch {
            // no-op
          }
        } finally {
          thumbnailInFlightRef.current.delete(quote.id);
        }
      }
    };

    run().catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [
    activePainterId,
    captureThumbnailFromVideo,
    firestore,
    quotes
  ]);

  const handleCustomerInfoSubmit = useCallback(async () => {
    if (!activePainterId || !editingQuoteId) return;

    const homeownerName = customerInfoForm.homeownerName.trim();
    const homeownerEmail = customerInfoForm.homeownerEmail.trim().toLowerCase();
    const homeownerPhone = customerInfoForm.homeownerPhone.trim();
    const homeownerAddress = customerInfoForm.homeownerAddress.trim();

    if (!homeownerName || !homeownerEmail || !homeownerAddress) {
      setCustomerInfoError('Name, email, and address are required.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(homeownerEmail)) {
      setCustomerInfoError('Enter a valid homeowner email.');
      return;
    }

    setSavingCustomerInfo(true);
    setCustomerInfoError(null);
    try {
      await updateDoc(
        doc(firestore, 'painters', activePainterId, 'quotes', editingQuoteId),
        {
          homeownerName,
          homeownerEmail,
          homeownerPhone: homeownerPhone || null,
          homeownerAddress,
          updatedAt: serverTimestamp()
        }
      );

      setQuotes((prevQuotes) => prevQuotes.map((quote) => {
        if (quote.id !== editingQuoteId) return quote;

        return {
          ...quote,
          homeownerName,
          homeownerEmail,
          homeownerPhone: homeownerPhone || null,
          homeownerAddress
        };
      }));
      setEditingQuoteId(null);
    } catch (submitError) {
      console.error('Failed to save customer info:', submitError);
      setCustomerInfoError('Failed to save customer info.');
    } finally {
      setSavingCustomerInfo(false);
    }
  }, [activePainterId, customerInfoForm, editingQuoteId, firestore]);

  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!mounted) return;
      setError(null);

      if (!user) {
        setPainterUser(false);
        setCheckingAuth(false);
        setQuotes([]);
        return;
      }

      try {
        const paintersQuery = query(
          collection(firestore, 'painters'),
          where('userId', '==', user.uid)
        );
        const snapshot = await getDocs(paintersQuery);
        if (!mounted) return;

        if (snapshot.empty) {
          setPainterUser(false);
          setCheckingAuth(false);
          setQuotes([]);
          return;
        }

        setPainterUser(true);
        setActivePainterId(snapshot.docs[0].id);
        setCheckingAuth(false);
        await loadQuotes(snapshot.docs[0].id);
      } catch (authError) {
        console.error('Quotes auth lookup failed:', authError);
        if (!mounted) return;
        setPainterUser(false);
        setCheckingAuth(false);
        setError('Failed to verify painter access.');
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [auth, firestore, loadQuotes]);

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
          background: 'transparent',
          color: '#0f172a',
          padding: 24
        }}
      >
        <div
          style={{
            maxWidth: 540,
            width: '100%',
            background: 'var(--app-surface-card)',
            border: '1px solid #dbe3ef',
            borderRadius: 16,
            padding: 24,
            textAlign: 'center'
          }}
        >
          <h2 style={{ margin: '0 0 8px 0' }}>Provider Login Required</h2>
          <p style={{ margin: 0, color: '#475569' }}>
            This quotes screen is restricted to signed-in provider accounts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'transparent',
        padding: '20px 12px'
      }}
    >
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 18,
            marginBottom: 26
          }}
        >
          <h1
            className="typography-page-title"
            style={{ margin: 0, color: '#0f172a', fontSize: 38 }}
          >
            Quotes History
          </h1>
          {!isLoadingQuotes && !error && !!activePainterId && (
            <button
              onClick={() => router.push('/call')}
              style={{
                border: 'none',
                borderRadius: 999,
                background: PRIMARY_COLOR_HEX,
                color: '#fff',
                padding: '10px 20px',
                fontWeight: 700,
                fontSize: 15,
                lineHeight: 1.2
              }}
            >
              New Call
            </button>
          )}
        </div>

        {isLoadingQuotes && <div style={{ color: '#475569' }}>Loading quotes...</div>}
        {!isLoadingQuotes && isRefreshingVideos && (
          <div style={{ color: '#475569' }}>Checking latest video processing status...</div>
        )}
        {!!error && <div style={{ color: '#b91c1c' }}>{error}</div>}
        {!isLoadingQuotes && !error && quotes.length === 0 && (
          <div style={{ color: '#475569' }}>No quotes yet.</div>
        )}

        <div style={{ display: 'grid', gap: 16 }}>
          {quotes.map((quote) => (
            <div
              key={quote.id}
              style={{
                width: '100%',
                maxWidth: 760,
                margin: '0 auto',
                borderRadius: 16,
                border: '1px solid #dbe3ef',
                background: 'var(--app-surface-card)',
                boxShadow: '0 8px 20px rgba(15,23,42,0.06)',
                padding: 16
              }}
            >
              <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
                {quote.videoUrl ? (
                  <video
                    src={`${quote.videoUrl}#t=0.001`}
                    poster={quote.thumbnailUrl || undefined}
                    controls
                    muted
                    onError={() => {
                      setQuotes((prevQuotes) => prevQuotes.map((item) =>
                        item.id === quote.id
                          ? {
                            ...item,
                            videoUrl: null,
                            videoStatus: 'error',
                            videoMessage: 'Video unavailable right now'
                          }
                          : item
                      ));
                      refreshQuoteVideo(quote).catch(() => undefined);
                    }}
                    style={{
                      width: '100%',
                      borderRadius: 12,
                      background: '#0f131a'
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      borderRadius: 12,
                      background: '#0f131a',
                      color: quote.videoStatus === 'storing' ? '#f8d27a' : '#94a3b8',
                      minHeight: 140,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <div>{quote.videoMessage}</div>
                    {quote.videoStatus === 'storing' && quote.recordingId && (
                      <div style={{ fontSize: 11, opacity: 0.8 }}>
                        Recording ID: {quote.recordingId}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div
                style={{
                  color: '#64748b',
                  fontSize: 12,
                  marginBottom: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap'
                }}
              >
                <span>{quote.createdAtLabel}</span>
                {quote.videoUrl && (
                  <button
                    onClick={() => {
                      handleDownloadVideo(quote);
                    }}
                    style={{
                      border: 'none',
                      borderRadius: 999,
                      background: PRIMARY_COLOR_HEX,
                      color: '#fff',
                      padding: '10px 20px',
                      fontWeight: 700,
                      fontSize: 15,
                      lineHeight: 1.2,
                      cursor: 'pointer'
                    }}
                  >
                    Download Video
                  </button>
                )}
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '30%' }} />
                  <col style={{ width: '42%' }} />
                  <col style={{ width: '28%' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th style={headerCellStyle}>Item</th>
                    <th style={headerCellStyle}>Description</th>
                    <th style={headerCellStyle}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.rows.map((row, index) => (
                    <tr key={`${quote.id}-${index}`} style={{ borderTop: '1px solid #e5eaf2' }}>
                      <td style={cellStyle}>
                        <div style={valueCellStyle}>{row.item || '-'}</div>
                      </td>
                      <td style={cellStyle}>
                        <div style={valueCellStyle}>{row.description || '-'}</div>
                      </td>
                      <td style={cellStyle}>
                        <div style={valueCellStyle}>${row.price.toFixed(2)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div
                style={{
                  marginTop: 12,
                  display: 'grid',
                  gridTemplateColumns: isMobileLayout ? '1fr' : '30% 42% 28%',
                  color: '#334155',
                  fontWeight: 700
                }}
              >
                {isMobileLayout ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ textAlign: 'left', padding: '0 4px' }}>
                      Total: ${quote.totalPrice.toFixed(2)}
                    </div>
                    <button
                      onClick={() => handleDownloadQuoteSummary(quote)}
                      style={{
                        border: 'none',
                        borderRadius: 999,
                        background: PRIMARY_COLOR_HEX,
                        color: '#fff',
                        padding: '8px 14px',
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer'
                      }}
                    >
                      Download Quote PDF
                    </button>
                  </div>
                ) : (
                  <>
                    <div />
                    <div />
                    <div
                      style={{
                        textAlign: 'left',
                        padding: '0 4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        justifyContent: 'space-between'
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: quote.isSigned ? '#15803d' : '#64748b' }}>
                        <span style={{ fontSize: 14 }}>{quote.isSigned ? '✅' : '⬜'}</span>
                        <span style={{ fontWeight: 700, fontSize: 12 }}>{quote.isSigned ? 'Signed' : 'Unsigned'}</span>
                      </span>
                      <span>Total: ${quote.totalPrice.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              {isMobileLayout && (
                <div style={{ marginTop: 10 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: quote.isSigned ? '#15803d' : '#64748b' }}>
                    <span style={{ fontSize: 14 }}>{quote.isSigned ? '✅' : '⬜'}</span>
                    <span style={{ fontWeight: 700, fontSize: 12 }}>{quote.isSigned ? 'Signed' : 'Unsigned'}</span>
                  </span>
                </div>
              )}

              <div
                style={{
                  border: '1px solid #dbe3ef',
                  borderRadius: 12,
                  background: '#f8fafc',
                  padding: 12,
                  display: 'grid',
                  gridTemplateColumns: isMobileLayout ? '1fr' : 'repeat(4, minmax(0, 1fr))',
                  gap: isMobileLayout ? 10 : 8,
                  marginTop: 12
                }}
              >
                {isMobileLayout ? (
                  <>
                    <div style={customerInfoMobileRowStyle}><strong>Homeowner:</strong> {quote.homeownerName || 'Not provided'}</div>
                    <div style={customerInfoMobileRowStyle}><strong>Email:</strong> {quote.homeownerEmail || 'Not provided'}</div>
                    <div style={customerInfoMobileRowStyle}><strong>Phone:</strong> {quote.homeownerPhone || 'Not provided'}</div>
                    <div style={customerInfoMobileRowStyle}><strong>Address:</strong> {quote.homeownerAddress || 'Not provided'}</div>
                    <div style={customerInfoMobileRowStyle}><strong>Quote ID:</strong> {quote.id}</div>
                  </>
                ) : (
                  <>
                    <div style={customerInfoItemStyle}>
                      <span style={customerInfoLabelStyle}>Homeowner</span>
                      <span>{quote.homeownerName || 'Not provided'}</span>
                    </div>
                    <div style={customerInfoItemStyle}>
                      <span style={customerInfoLabelStyle}>Email</span>
                      <span>{quote.homeownerEmail || 'Not provided'}</span>
                    </div>
                    <div style={customerInfoItemStyle}>
                      <span style={customerInfoLabelStyle}>Phone</span>
                      <span>{quote.homeownerPhone || 'Not provided'}</span>
                    </div>
                    <div style={customerInfoItemStyle}>
                      <span style={customerInfoLabelStyle}>Address</span>
                      <span>{quote.homeownerAddress || 'Not provided'}</span>
                    </div>
                  </>
                )}
              </div>

              {!isMobileLayout && (
                <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <button
                      onClick={() => openCustomerInfoModal(quote)}
                      style={{
                        border: '1px solid #cbd5e1',
                        borderRadius: 999,
                        background: '#fff',
                        color: '#334155',
                        padding: '10px 14px',
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: 'pointer'
                      }}
                    >
                      Edit Customer Info
                    </button>
                    <button
                      onClick={() => handleDownloadQuoteSummary(quote)}
                      style={{
                        border: 'none',
                        borderRadius: 999,
                        background: PRIMARY_COLOR_HEX,
                        color: '#fff',
                        padding: '10px 16px',
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: 'pointer'
                      }}
                    >
                      Download Quote PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {editingQuoteId && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            background: 'rgba(15, 23, 42, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
          onClick={closeCustomerInfoModal}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 420,
              background: 'var(--app-surface-card)',
              borderRadius: 16,
              border: '1px solid #dbe3ef',
              boxShadow: '0 18px 40px rgba(15,23,42,0.24)',
              padding: 16
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{ marginBottom: 12, color: '#0f172a', fontWeight: 700, fontSize: 18 }}>
              Complete Customer Info
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="(555) 123-4567"
                value={customerInfoForm.homeownerPhone}
                onChange={(event) => setCustomerInfoForm((prev) => ({
                  ...prev,
                  homeownerPhone: event.target.value
                }))}
                style={modalInputStyle}
              />
              <input
                placeholder="Homeowner Name (Optional)"
                value={customerInfoForm.homeownerName}
                onChange={(event) => setCustomerInfoForm((prev) => ({
                  ...prev,
                  homeownerName: event.target.value
                }))}
                style={modalInputStyle}
              />
              <MapsLoaded>
                <QuoteAddressField
                  value={customerInfoForm.homeownerAddress}
                  onChange={(value) => setCustomerInfoForm((prev) => ({
                    ...prev,
                    homeownerAddress: value
                  }))}
                />
              </MapsLoaded>
              <input
                type="email"
                placeholder="Homeowner Email (Optional)"
                value={customerInfoForm.homeownerEmail}
                onChange={(event) => setCustomerInfoForm((prev) => ({
                  ...prev,
                  homeownerEmail: event.target.value
                }))}
                style={modalInputStyle}
              />
            </div>
            {customerInfoError && (
              <div style={{ marginTop: 10, color: '#b91c1c', fontSize: 13 }}>
                {customerInfoError}
              </div>
            )}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 8,
                marginTop: 14
              }}
            >
              <button
                onClick={closeCustomerInfoModal}
                disabled={isSavingCustomerInfo}
                style={{
                  border: '1px solid #cbd5e1',
                  borderRadius: 10,
                  background: 'var(--app-surface-card)',
                  color: '#334155',
                  padding: '8px 12px',
                  fontWeight: 600,
                  cursor: isSavingCustomerInfo ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCustomerInfoSubmit}
                disabled={isSavingCustomerInfo}
                style={{
                  border: 'none',
                  borderRadius: 10,
                  background: PRIMARY_COLOR_HEX,
                  color: '#fff',
                  padding: '8px 14px',
                  fontWeight: 700,
                  cursor: isSavingCustomerInfo ? 'not-allowed' : 'pointer',
                  opacity: isSavingCustomerInfo ? 0.75 : 1
                }}
              >
                {isSavingCustomerInfo ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const headerCellStyle: React.CSSProperties = {
  textAlign: 'left',
  color: '#64748b',
  fontSize: 12,
  fontWeight: 700,
  padding: '8px 4px'
};

const cellStyle: React.CSSProperties = {
  padding: '8px 4px',
  verticalAlign: 'middle'
};

const valueCellStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #dbe3ef',
  borderRadius: 10,
  background: '#f8fafc',
  color: '#0f172a',
  padding: '8px 10px',
  fontSize: 13,
  minHeight: 34,
  display: 'flex',
  alignItems: 'center'
};

const customerInfoItemStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  color: '#0f172a',
  fontSize: 13
};

const customerInfoLabelStyle: React.CSSProperties = {
  color: '#64748b',
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: 0.4
};

const customerInfoMobileRowStyle: React.CSSProperties = {
  color: '#0f172a',
  fontSize: 13,
  lineHeight: 1.45
};

const modalInputStyle: React.CSSProperties = {
  width: '100%',
  height: 44,
  borderRadius: 10,
  border: '1px solid #dbe3ef',
  background: 'var(--app-surface-card)',
  color: '#0f172a',
  padding: '0 12px',
  fontSize: 14
};
