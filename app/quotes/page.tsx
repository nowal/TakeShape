'use client';

import firebase from '@/lib/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  getDocs,
  getFirestore,
  orderBy,
  query,
  where
} from 'firebase/firestore';
import { getDownloadURL, getStorage, ref as storageRef } from 'firebase/storage';
import React, { useEffect, useMemo, useState } from 'react';

type QuotePricingRow = {
  item: string;
  description: string;
  price: number;
};

type QuoteCard = {
  id: string;
  videoUrl: string | null;
  rows: QuotePricingRow[];
  totalPrice: number;
  createdAtLabel: string;
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

const resolveVideoEstimateValue = (videoEstimates: any): string | null => {
  if (!Array.isArray(videoEstimates) || !videoEstimates.length) return null;
  for (let index = videoEstimates.length - 1; index >= 0; index -= 1) {
    const value = String(videoEstimates[index]?.value || '').trim();
    if (value) return value;
  }
  return null;
};

export default function QuotesPage() {
  const auth = useMemo(() => getAuth(firebase), []);
  const firestore = useMemo(() => getFirestore(firebase), []);
  const storage = useMemo(() => getStorage(firebase), []);
  const [isCheckingAuth, setCheckingAuth] = useState(true);
  const [isPainterUser, setPainterUser] = useState(false);
  const [isLoadingQuotes, setLoadingQuotes] = useState(false);
  const [quotes, setQuotes] = useState<QuoteCard[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadQuotes = async (painterId: string) => {
      setLoadingQuotes(true);
      try {
        const quotesQuery = query(
          collection(firestore, 'painters', painterId, 'quotes'),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(quotesQuery);

        const cards = await Promise.all(
          snapshot.docs.map(async (quoteDoc) => {
            const data = quoteDoc.data() as Record<string, any>;
            const pricing = data.pricing || {};
            const rowsRaw = Array.isArray(pricing.rows) ? pricing.rows : [];
            const rows: QuotePricingRow[] = rowsRaw.map((row: any) => ({
              item: String(row?.item || ''),
              description: String(row?.description || ''),
              price: Number(row?.price) || 0
            }));

            const storedVideoValue = resolveVideoEstimateValue(data.videoEstimates);
            let videoUrl: string | null = null;
            if (storedVideoValue) {
              if (/^https?:\/\//i.test(storedVideoValue)) {
                videoUrl = storedVideoValue;
              } else {
                try {
                  videoUrl = await getDownloadURL(storageRef(storage, storedVideoValue));
                } catch {
                  videoUrl = null;
                }
              }
            }

            return {
              id: quoteDoc.id,
              videoUrl,
              rows,
              totalPrice: Number(pricing.totalPrice) || 0,
              createdAtLabel: resolveDisplayDate(data.createdAt || pricing.updatedAt || '')
            } as QuoteCard;
          })
        );

        if (mounted) {
          setQuotes(cards);
        }
      } catch (loadError) {
        console.error('Failed to load quotes:', loadError);
        if (mounted) {
          setError('Failed to load quotes.');
        }
      } finally {
        if (mounted) {
          setLoadingQuotes(false);
        }
      }
    };

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
  }, [auth, firestore, storage]);

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
            This quotes screen is restricted to signed-in painter accounts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'radial-gradient(circle at 15% 0%, #edf7ff 0%, #f5f7fb 55%, #eef2f8 100%)',
        padding: '20px 12px'
      }}
    >
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <h1 style={{ margin: 0, color: '#0f172a', fontSize: 28 }}>Quotes</h1>
        <p style={{ margin: '8px 0 18px 0', color: '#475569' }}>
          Completed quote summaries with estimate videos.
        </p>

        {isLoadingQuotes && <div style={{ color: '#475569' }}>Loading quotes...</div>}
        {!!error && <div style={{ color: '#b91c1c' }}>{error}</div>}
        {!isLoadingQuotes && !error && quotes.length === 0 && (
          <div style={{ color: '#475569' }}>No quotes yet.</div>
        )}

        <div style={{ display: 'grid', gap: 16 }}>
          {quotes.map((quote) => (
            <div
              key={quote.id}
              style={{
                borderRadius: 16,
                border: '1px solid #dbe3ef',
                background: '#fff',
                boxShadow: '0 8px 20px rgba(15,23,42,0.06)',
                padding: 16
              }}
            >
              {quote.videoUrl ? (
                <video
                  src={`${quote.videoUrl}#t=0.001`}
                  controls
                  muted
                  style={{ width: '100%', borderRadius: 12, marginBottom: 12, background: '#0f131a' }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    borderRadius: 12,
                    marginBottom: 12,
                    background: '#0f131a',
                    color: '#94a3b8',
                    minHeight: 140,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  No video estimate available
                </div>
              )}

              <div style={{ color: '#64748b', fontSize: 12, marginBottom: 10 }}>
                Quote ID: {quote.id} · {quote.createdAtLabel}
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

              <div style={{ marginTop: 12, color: '#334155', fontWeight: 700 }}>
                Total: ${quote.totalPrice.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
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
