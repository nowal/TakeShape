'use client';

import firebase from '@/lib/firebase';
import { Mic, MicOff, PhoneOff } from 'lucide-react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import Image from 'next/image';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PRIMARY_COLOR_HEX } from '@/constants/brand-color';

type PricingRow = {
  id: string;
  item: string;
  description: string;
  price: string;
};

type UploadedQuote = {
  name: string;
  mimeType: string;
  objectUrl: string;
  isImage: boolean;
};

const createRow = (): PricingRow => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
  item: '',
  description: '',
  price: ''
});

export default function PricingPage() {
  const AUTH_CHECK_TIMEOUT_MS = 10000;
  const auth = useMemo(() => getAuth(firebase), []);
  const firestore = useMemo(() => getFirestore(firebase), []);
  const [isCheckingAuth, setCheckingAuth] = useState(true);
  const [isPainterUser, setPainterUser] = useState(false);
  const [rows, setRows] = useState<PricingRow[]>([createRow()]);
  const [isMuted, setMuted] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [hasSubmittedQuote, setHasSubmittedQuote] = useState(false);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [uploadedQuote, setUploadedQuote] = useState<UploadedQuote | null>(null);
  const [status, setStatus] = useState('Build quote while audio call remains active.');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraRollInputRef = useRef<HTMLInputElement>(null);
  const takePhotoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;
    const authCheckTimeout = window.setTimeout(() => {
      if (!isMounted) return;
      console.warn(
        'Pricing auth check timed out. Continuing as signed out.'
      );
      setPainterUser(false);
      setCheckingAuth(false);
    }, AUTH_CHECK_TIMEOUT_MS);

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!isMounted) return;
        try {
          if (!user) {
            setPainterUser(false);
            return;
          }

          const paintersQuery = query(
            collection(firestore, 'painters'),
            where('userId', '==', user.uid)
          );
          const snapshot = await getDocs(paintersQuery);
          if (!isMounted) return;
          setPainterUser(!snapshot.empty);
        } catch (error) {
          console.error('Pricing auth check failed:', error);
          if (!isMounted) return;
          setPainterUser(false);
        } finally {
          if (!isMounted) return;
          window.clearTimeout(authCheckTimeout);
          setCheckingAuth(false);
        }
      },
      (error) => {
        if (!isMounted) return;
        console.error('Pricing auth listener failed:', error);
        window.clearTimeout(authCheckTimeout);
        setPainterUser(false);
        setCheckingAuth(false);
      }
    );

    return () => {
      isMounted = false;
      window.clearTimeout(authCheckTimeout);
      unsubscribe();
    };
  }, [auth, firestore]);

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

  const updateRow = (id: string, next: Partial<PricingRow>) => {
    setRows((previous) =>
      previous.map((row) => {
        if (row.id !== id) return row;
        return { ...row, ...next };
      })
    );
  };

  const addRow = () => {
    setRows((previous) => [...previous, createRow()]);
  };

  const isAllowedUpload = (file: File) => {
    const type = String(file.type || '').toLowerCase();
    if (type === 'application/pdf') return true;
    if (type.startsWith('image/')) return true;

    const lowerName = file.name.toLowerCase();
    return (
      lowerName.endsWith('.pdf') ||
      lowerName.endsWith('.jpg') ||
      lowerName.endsWith('.jpeg') ||
      lowerName.endsWith('.png') ||
      lowerName.endsWith('.heic') ||
      lowerName.endsWith('.heif') ||
      lowerName.endsWith('.webp')
    );
  };

  const onUploadSelected = (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;

    if (!isAllowedUpload(file)) {
      setStatus('Unsupported file type. Upload a PDF or image file.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setUploadedQuote((previous) => {
      if (previous?.objectUrl) {
        URL.revokeObjectURL(previous.objectUrl);
      }
      return {
        name: file.name,
        mimeType: file.type,
        objectUrl,
        isImage: file.type.startsWith('image/')
      };
    });
    setShowUploadOptions(false);
    setStatus('Quote upload ready. Submit when you are ready.');
  };

  useEffect(() => {
    return () => {
      if (uploadedQuote?.objectUrl) {
        URL.revokeObjectURL(uploadedQuote.objectUrl);
      }
    };
  }, [uploadedQuote]);

  const handleSubmitQuote = async () => {
    setSubmitting(true);
    setStatus(hasSubmittedQuote ? 'Updating quote...' : 'Submitting quote...');
    await new Promise((resolve) => setTimeout(resolve, 450));
    setHasSubmittedQuote(true);
    setSubmitting(false);
    setStatus('Quote ready. Continue reviewing with homeowner.');
  };

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
            This pricing screen is restricted to signed-in painter accounts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#000',
        color: '#fff',
        padding: 0
      }}
    >
      <div style={{ maxWidth: '100%', margin: '0 auto' }}>
        <div
          style={{
            position: 'fixed',
            top: 10,
            left: 0,
            right: 0,
            zIndex: 20,
            textAlign: 'center',
            fontSize: 12,
            color: '#d2d7df',
            textShadow: '0 1px 2px rgba(0,0,0,0.8)'
          }}
        >
          <div style={{ fontSize: 12, color: '#92a0b5', letterSpacing: 1 }}>Create Quote</div>
          <div style={{ marginTop: 6, fontWeight: 600 }}>
            {status}
          </div>
        </div>

        <div
          style={{
            position: 'fixed',
            inset: 0,
            overflow: 'hidden',
            background: '#000',
            zIndex: 10
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: '#000',
              padding: '24px 12px 108px',
              color: '#d7dfeb',
              overflowY: 'auto'
            }}
          >
            <div style={{ marginBottom: 14, fontWeight: 700, fontSize: 17 }}>Create Quote</div>

            {!uploadedQuote && (
              <>
                <div>
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
                      {rows.map((row) => (
                        <tr key={row.id} style={{ borderTop: '1px solid #1f2937' }}>
                          <td style={quoteCellStyle}>
                            <input
                              value={row.item}
                              onChange={(event) => updateRow(row.id, { item: event.target.value })}
                              placeholder="Interior Walls"
                              style={quoteInputStyle}
                            />
                          </td>
                          <td style={quoteCellStyle}>
                            <input
                              value={row.description}
                              onChange={(event) => updateRow(row.id, { description: event.target.value })}
                              placeholder="Paint and prep"
                              style={quoteInputStyle}
                            />
                          </td>
                          <td style={quoteCellStyle}>
                            <div style={quotePriceShellStyle}>
                              <span style={{ color: '#8ea0bb', fontWeight: 600 }}>$</span>
                              <input
                                value={row.price}
                                onChange={(event) =>
                                  updateRow(row.id, { price: sanitizeMoneyInput(event.target.value) })
                                }
                                placeholder="0.00"
                                inputMode="decimal"
                                aria-label="Price"
                                style={quotePriceInputStyle}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  onClick={addRow}
                  style={{
                    marginTop: 14,
                    height: 40,
                    borderRadius: 999,
                    border: 'none',
                    padding: '0 16px',
                    background: PRIMARY_COLOR_HEX,
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'block',
                    marginLeft: 'auto',
                    marginRight: 'auto'
                  }}
                >
                  Add Item
                </button>
                <button
                  onClick={() => setShowUploadOptions((previous) => !previous)}
                  style={{
                    marginTop: 10,
                    height: 40,
                    borderRadius: 999,
                    border: '1px solid #334155',
                    padding: '0 16px',
                    background: '#131a24',
                    color: '#d7dfeb',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'block',
                    marginLeft: 'auto',
                    marginRight: 'auto'
                  }}
                >
                  Upload Quote
                </button>
                {showUploadOptions && (
                  <div
                    style={{
                      marginTop: 12,
                      border: '1px solid #2a3444',
                      borderRadius: 12,
                      background: '#0f131a',
                      padding: 12,
                      display: 'grid',
                      gap: 8
                    }}
                  >
                    <button onClick={() => fileInputRef.current?.click()} style={uploadOptionButtonStyle}>
                      Upload from Files
                    </button>
                    <button onClick={() => cameraRollInputRef.current?.click()} style={uploadOptionButtonStyle}>
                      Choose from Camera Roll
                    </button>
                    <button onClick={() => takePhotoInputRef.current?.click()} style={uploadOptionButtonStyle}>
                      Take a Picture
                    </button>
                  </div>
                )}
              </>
            )}

            {uploadedQuote && (
              <div
                style={{
                  height: 'calc(100dvh - 180px)',
                  border: '1px solid #1f2937',
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: '#0b0f16'
                }}
              >
                {uploadedQuote.isImage ? (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      position: 'relative',
                      background: '#0b0f16'
                    }}
                  >
                    <Image
                      src={uploadedQuote.objectUrl}
                      alt={uploadedQuote.name || 'Uploaded quote image'}
                      fill
                      unoptimized
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                ) : (
                  <iframe
                    src={uploadedQuote.objectUrl}
                    title={uploadedQuote.name || 'Uploaded quote PDF'}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      background: '#fff'
                    }}
                  />
                )}
              </div>
            )}
          </div>
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
            {!uploadedQuote && (
              <button
                onClick={() => setMuted((prev) => !prev)}
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
            )}

            <button
              onClick={handleSubmitQuote}
              disabled={isSubmitting}
              style={{
                height: 48,
                borderRadius: 999,
                border: 'none',
                padding: '0 18px',
                background: isSubmitting ? `${PRIMARY_COLOR_HEX}99` : PRIMARY_COLOR_HEX,
                color: '#fff',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              {isSubmitting
                ? (hasSubmittedQuote ? 'Updating...' : 'Submitting...')
                : (hasSubmittedQuote ? 'Update Quote' : 'Submit Quote')}
            </button>

            {!uploadedQuote && (
              <button
                onClick={() => setStatus('Sandbox end call tapped.')}
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
            )}
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf,image/*"
          onChange={(event) => onUploadSelected(event.target.files)}
          style={{ display: 'none' }}
        />
        <input
          ref={cameraRollInputRef}
          type="file"
          accept="image/*"
          onChange={(event) => onUploadSelected(event.target.files)}
          style={{ display: 'none' }}
        />
        <input
          ref={takePhotoInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(event) => onUploadSelected(event.target.files)}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
}

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

const uploadOptionButtonStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #2a3444',
  background: '#121826',
  color: '#d7dfeb',
  borderRadius: 10,
  height: 40,
  fontWeight: 600,
  cursor: 'pointer'
};
