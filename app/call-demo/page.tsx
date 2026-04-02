'use client';

import { Mic, MicOff, PhoneOff, Volume2 } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PRIMARY_COLOR_HEX } from '@/constants/brand-color';

type DemoPhase = 'idle' | 'videoInviteSent' | 'quoteDraft' | 'ended';

type QuoteRow = {
  id: string;
  item: string;
  description: string;
  price: string;
};

const createQuoteRow = (): QuoteRow => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
  item: '',
  description: '',
  price: ''
});

const sanitizeMoneyInput = (value: string) => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const firstDotIndex = cleaned.indexOf('.');
  if (firstDotIndex === -1) return cleaned;
  const beforeDot = cleaned.slice(0, firstDotIndex + 1);
  const afterDot = cleaned
    .slice(firstDotIndex + 1)
    .replace(/\./g, '')
    .slice(0, 2);
  return `${beforeDot}${afterDot}`;
};

const parseMoneyValue = (value: string) => {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.round(parsed * 100) / 100;
};

const CallDemoPage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [phase, setPhase] = useState<DemoPhase>('idle');
  const [status, setStatus] = useState('Upload a video to start demo mode.');
  const [videoObjectUrl, setVideoObjectUrl] = useState<string>('');
  const [videoFileName, setVideoFileName] = useState('');
  const [isMuted, setMuted] = useState(false);
  const [playbackVolume, setPlaybackVolume] = useState(1);
  const [isCopyLinkHovered, setCopyLinkHovered] = useState(false);
  const [isCreateQuoteHovered, setCreateQuoteHovered] = useState(false);
  const [isAddQuoteRowHovered, setAddQuoteRowHovered] = useState(false);
  const [hasCopiedVideoLink, setHasCopiedVideoLink] = useState(false);
  const [guestLink, setGuestLink] = useState('');
  const [quoteRows, setQuoteRows] = useState<QuoteRow[]>([createQuoteRow()]);
  const [isSavingQuote, setSavingQuote] = useState(false);
  const [hasSubmittedQuote, setSubmittedQuote] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.volume = playbackVolume;
  }, [playbackVolume]);

  useEffect(() => {
    return () => {
      if (videoObjectUrl) {
        URL.revokeObjectURL(videoObjectUrl);
      }
    };
  }, [videoObjectUrl]);

  const quoteTotal = useMemo(
    () =>
      quoteRows.reduce(
        (sum, row) => sum + parseMoneyValue(row.price),
        0
      ),
    [quoteRows]
  );

  const startDemo = async () => {
    if (!videoObjectUrl) {
      setStatus('Choose a video file first.');
      return;
    }
    const appBase = window.location.origin;
    const link = `${appBase}/consult?demo=1`;
    setGuestLink(link);
    setHasCopiedVideoLink(true);
    setPhase('videoInviteSent');
    setStatus('Demo call ready.');

    if (videoRef.current) {
      try {
        await videoRef.current.play();
      } catch {
        // no-op
      }
    }
  };

  const copyConsultLinkNow = async () => {
    if (!guestLink) return;
    let copied = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(guestLink);
        copied = true;
      } else {
        throw new Error('Clipboard unavailable');
      }
    } catch {
      const manual = window.prompt(
        'Copy this /consult link and send to the homeowner:',
        guestLink
      );
      copied = Boolean(manual && manual.trim());
    }

    setHasCopiedVideoLink(copied);
    setStatus(
      copied
        ? 'Video Mode'
        : 'Auto-copy was blocked on this device. Copy the link from the prompt.'
    );
  };

  const enterQuoteMode = () => {
    setPhase('quoteDraft');
    setStatus('Quote mode active. Demo video remains visible.');
  };

  const updateQuoteRow = (id: string, next: Partial<QuoteRow>) => {
    setQuoteRows((previous) =>
      previous.map((row) => (row.id === id ? { ...row, ...next } : row))
    );
  };

  const addQuoteRow = () => {
    setQuoteRows((previous) => [...previous, createQuoteRow()]);
  };

  const submitOrUpdateQuote = async () => {
    setSavingQuote(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSubmittedQuote(true);
    setSavingQuote(false);
    setStatus('Quote submitted in demo mode.');
  };

  const endDemo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setPhase('ended');
    setStatus('Call ended.');
  };

  const restartDemo = async () => {
    if (!videoObjectUrl) {
      setPhase('idle');
      setStatus('Upload a video to start demo mode.');
      return;
    }
    setQuoteRows([createQuoteRow()]);
    setSubmittedQuote(false);
    setHasCopiedVideoLink(true);
    setPhase('videoInviteSent');
    setStatus('Demo call ready.');
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      try {
        await videoRef.current.play();
      } catch {
        // no-op
      }
    }
  };

  const isActiveCallUI =
    phase === 'videoInviteSent' || phase === 'quoteDraft';

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: isActiveCallUI ? '#000' : 'var(--app-bg)',
        color: isActiveCallUI ? '#fff' : '#0f172a',
        padding: isActiveCallUI ? 0 : '24px 16px'
      }}
    >
      {phase === 'idle' && (
        <div
          style={{
            maxWidth: 520,
            margin: '0 auto',
            borderRadius: 18,
            border: '1px solid #dbe3ef',
            background: 'var(--app-surface-card)',
            padding: 20
          }}
        >
          <h1 style={{ margin: 0, fontSize: 28, color: '#0f172a' }}>
            Call Demo
          </h1>
          <p style={{ margin: '8px 0 16px', color: '#475569' }}>
            Upload a static video to simulate the live homeowner video UI from `/call`.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              if (videoObjectUrl) {
                URL.revokeObjectURL(videoObjectUrl);
              }
              const nextUrl = URL.createObjectURL(file);
              setVideoObjectUrl(nextUrl);
              setVideoFileName(file.name);
              setStatus(`Loaded ${file.name}`);
            }}
            style={{ width: '100%' }}
          />
          <div style={{ marginTop: 12, color: '#64748b', fontSize: 13 }}>
            {videoFileName || 'No video selected yet'}
          </div>
          <button
            onClick={startDemo}
            disabled={!videoObjectUrl}
            style={{
              marginTop: 16,
              width: '100%',
              height: 48,
              borderRadius: 12,
              border: 'none',
              background: videoObjectUrl ? PRIMARY_COLOR_HEX : `${PRIMARY_COLOR_HEX}99`,
              color: '#fff',
              fontWeight: 700,
              cursor: videoObjectUrl ? 'pointer' : 'not-allowed'
            }}
          >
            Start Demo Call UI
          </button>
          <div style={{ marginTop: 12, fontSize: 13, color: '#475569' }}>
            {status}
          </div>
        </div>
      )}

      {isActiveCallUI && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            overflow: 'hidden',
            background: '#000',
            zIndex: 10
          }}
        >
          <video
            ref={videoRef}
            src={videoObjectUrl}
            autoPlay
            loop
            playsInline
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              background: '#000',
              opacity: phase === 'quoteDraft' ? 0.45 : 1
            }}
          />

          {phase === 'quoteDraft' && (
            <div
              style={{
                position: 'absolute',
                top: 70,
                left: 12,
                right: 12,
                bottom: 146,
                borderRadius: 18,
                border: '1px solid #283142',
                background: 'rgba(8, 10, 13, 0.86)',
                padding: 14,
                overflowY: 'auto'
              }}
            >
              <div style={{ marginBottom: 10, fontWeight: 700, fontSize: 17 }}>
                Create Quote (Demo)
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '28%' }} />
                  <col style={{ width: '44%' }} />
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
                  {quoteRows.map((row) => (
                    <tr
                      key={row.id}
                      style={{ borderTop: '1px solid #1f2937' }}
                    >
                      <td style={quoteCellStyle}>
                        <input
                          value={row.item}
                          onChange={(event) =>
                            updateQuoteRow(row.id, {
                              item: event.target.value
                            })
                          }
                          placeholder="Item"
                          style={quoteInputStyle}
                        />
                      </td>
                      <td style={quoteCellStyle}>
                        <input
                          value={row.description}
                          onChange={(event) =>
                            updateQuoteRow(row.id, {
                              description: event.target.value
                            })
                          }
                          placeholder="Description"
                          style={quoteInputStyle}
                        />
                      </td>
                      <td style={quoteCellStyle}>
                        <div style={quotePriceShellStyle}>
                          <span style={{ color: '#8ea0bb', fontWeight: 600 }}>
                            $
                          </span>
                          <input
                            value={row.price}
                            onChange={(event) =>
                              updateQuoteRow(row.id, {
                                price: sanitizeMoneyInput(
                                  event.target.value
                                )
                              })
                            }
                            placeholder="0.00"
                            inputMode="decimal"
                            style={quotePriceInputStyle}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                onClick={addQuoteRow}
                onMouseEnter={() => setAddQuoteRowHovered(true)}
                onMouseLeave={() => setAddQuoteRowHovered(false)}
                style={{
                  marginTop: 14,
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  border: 'none',
                  background: isAddQuoteRowHovered ? '#E73152' : PRIMARY_COLOR_HEX,
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 24,
                  lineHeight: 1,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: 'auto',
                  marginRight: 'auto'
                }}
                aria-label="Add quote item"
              >
                +
              </button>
              <div style={{ marginTop: 12, color: '#9fb0c8', fontSize: 13 }}>
                Total: ${quoteTotal.toFixed(2)}
              </div>
            </div>
          )}

          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              padding: '10px 12px 14px',
              background:
                'linear-gradient(to top, rgba(8,10,13,0.92), rgba(8,10,13,0.35), rgba(8,10,13,0))',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10
            }}
          >
            {phase === 'videoInviteSent' && (
              <div
                style={{
                  width: '100%',
                  maxWidth: 420,
                  display: 'flex',
                  gap: 10
                }}
              >
                <button
                  onClick={copyConsultLinkNow}
                  onMouseEnter={() => setCopyLinkHovered(true)}
                  onMouseLeave={() => setCopyLinkHovered(false)}
                  style={pillButtonStyle(
                    isCopyLinkHovered
                      ? '#E73152'
                      : PRIMARY_COLOR_HEX
                  )}
                >
                  Re-copy Link
                </button>
                <button
                  onClick={enterQuoteMode}
                  onMouseEnter={() => setCreateQuoteHovered(true)}
                  onMouseLeave={() => setCreateQuoteHovered(false)}
                  style={pillButtonStyle(
                    isCreateQuoteHovered
                      ? '#E73152'
                      : PRIMARY_COLOR_HEX
                  )}
                >
                  Create Quote
                </button>
              </div>
            )}

            {phase === 'quoteDraft' && (
              <button
                onClick={submitOrUpdateQuote}
                disabled={isSavingQuote}
                style={{
                  ...pillButtonStyle(
                    isSavingQuote
                      ? `${PRIMARY_COLOR_HEX}99`
                      : PRIMARY_COLOR_HEX
                  ),
                  maxWidth: 360,
                  cursor: isSavingQuote ? 'not-allowed' : 'pointer'
                }}
              >
                {isSavingQuote
                  ? hasSubmittedQuote
                    ? 'Updating...'
                    : 'Submitting...'
                  : hasSubmittedQuote
                    ? 'Update Quote'
                    : 'Submit Quote'}
              </button>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                width: '100%',
                flexWrap: 'nowrap'
              }}
            >
              <button
                onClick={() => setMuted((current) => !current)}
                style={{
                  width: 58,
                  height: 58,
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
                onClick={() =>
                  setPlaybackVolume((current) =>
                    current > 0.5 ? 0.2 : 1
                  )
                }
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: '50%',
                  border: 'none',
                  background: '#fff',
                  color: '#111',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-label="Toggle playback volume"
              >
                <Volume2 size={20} />
              </button>

              <button
                onClick={endDemo}
                style={{
                  width: 58,
                  height: 58,
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

          </div>

        </div>
      )}

      {phase === 'ended' && (
        <div
          style={{
            maxWidth: 520,
            margin: '0 auto',
            borderRadius: 18,
            border: '1px solid #dbe3ef',
            background: 'var(--app-surface-card)',
            padding: 20,
            textAlign: 'center'
          }}
        >
          <div style={{ color: '#475569', marginBottom: 14 }}>
            Demo call ended.
          </div>
          <button
            onClick={() => {
              restartDemo().catch(() => undefined);
            }}
            style={{
              border: 'none',
              borderRadius: 999,
              padding: '10px 18px',
              color: '#fff',
              background: PRIMARY_COLOR_HEX,
              fontWeight: 700
            }}
          >
            Restart Demo
          </button>
        </div>
      )}
    </div>
  );
};

const pillButtonStyle = (
  background: string
): React.CSSProperties => ({
  width: '100%',
  height: 48,
  borderRadius: 999,
  border: 'none',
  padding: '0 18px',
  background,
  color: '#fff',
  fontWeight: 700,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  whiteSpace: 'nowrap'
});

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

const quoteInputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #2a3444',
  borderRadius: 10,
  background: '#0f131a',
  color: '#fff',
  padding: '8px 10px',
  fontSize: 13
};

const quotePriceShellStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #2a3444',
  borderRadius: 10,
  background: '#0f131a',
  color: '#fff',
  padding: '8px 10px',
  fontSize: 13,
  display: 'flex',
  alignItems: 'center',
  gap: 4
};

const quotePriceInputStyle: React.CSSProperties = {
  width: '100%',
  border: 'none',
  outline: 'none',
  background: 'transparent',
  color: '#fff',
  fontSize: 13
};

export default CallDemoPage;
