import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { getSignalWireConfig } from '@/app/api/signalwire/_lib';
import firebase from '@/lib/firebase';
import {
  doc as clientDoc,
  getDoc as clientGetDoc,
  getFirestore as getClientFirestore,
  updateDoc as clientUpdateDoc
} from 'firebase/firestore';

export const dynamic = 'force-dynamic';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const extractPlaybackUrl = (payload: any): string | null => {
  if (!payload || typeof payload !== 'object') return null;

  const candidates = [
    payload.url,
    payload.mp4_url,
    payload.playback_url,
    payload.download_url,
    payload.recording_url,
    payload.media_url,
    payload.video_url,
    payload.uri,
    payload?.links?.download,
    payload?.links?.playback,
    payload?.links?.self
  ];
  const firstUrl = candidates.find((value) => typeof value === 'string' && /^https?:\/\//.test(value));
  return firstUrl || null;
};

const fetchRecordingUntilReady = async ({
  recordingId,
  waitMs
}: {
  recordingId: string;
  waitMs: number;
}) => {
  const config = getSignalWireConfig();
  if (!config) {
    throw new Error('SignalWire credentials not configured');
  }

  const deadline = Date.now() + Math.max(0, waitMs);
  let lastPayload: any = null;
  while (true) {
    const response = await fetch(
      `https://${config.spaceUrl}/api/video/room_recordings/${recordingId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Basic ${config.authHeader}`,
          Accept: 'application/json'
        },
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`SignalWire room_recordings fetch failed (${response.status}): ${details}`);
    }

    const payload = await response.json();
    lastPayload = payload?.data || payload;
    const state = String(lastPayload?.state || lastPayload?.status || '').toLowerCase();
    const url = extractPlaybackUrl(lastPayload);
    const isReady = state === 'completed' || state === 'finished' || state === 'available';

    if (url && isReady) {
      return { ready: true, url, payload: lastPayload };
    }
    if (Date.now() >= deadline) {
      return { ready: false, url: url || null, payload: lastPayload };
    }
    await sleep(1000);
  }
};

export async function POST(request: NextRequest) {
  try {
    const {
      painterDocId,
      quoteId,
      recordingId,
      waitMs = 7000
    } = await request.json();

    const normalizedPainterDocId = String(painterDocId || '').trim();
    const normalizedQuoteId = String(quoteId || '').trim();
    const normalizedRecordingId = String(recordingId || '').trim();

    if (!normalizedPainterDocId || !normalizedQuoteId) {
      return NextResponse.json(
        { error: 'painterDocId and quoteId are required' },
        { status: 400 }
      );
    }

    let quoteData: Record<string, any> | null = null;
    let adminQuoteRef: any = null;
    let clientQuoteRef: any = null;
    let readSource: 'admin' | 'client-fallback' = 'admin';
    let adminReadError: string | null = null;

    try {
      const firestore = getAdminFirestore();
      adminQuoteRef = firestore
        .collection('painters')
        .doc(normalizedPainterDocId)
        .collection('quotes')
        .doc(normalizedQuoteId);
      const quoteSnap = await adminQuoteRef.get();
      if (!quoteSnap.exists) {
        return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
      }
      quoteData = quoteSnap.data() as Record<string, any>;
    } catch (error) {
      adminReadError = (error as Error)?.message || 'admin read failed';
      readSource = 'client-fallback';
      const clientFirestore = getClientFirestore(firebase);
      clientQuoteRef = clientDoc(
        clientFirestore,
        'painters',
        normalizedPainterDocId,
        'quotes',
        normalizedQuoteId
      );
      const quoteSnap = await clientGetDoc(clientQuoteRef);
      if (!quoteSnap.exists()) {
        return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
      }
      quoteData = quoteSnap.data() as Record<string, any>;
    }

    const updateQuote = async (payload: Record<string, any>) => {
      if (readSource === 'admin' && adminQuoteRef) {
        await adminQuoteRef.update(payload);
        return;
      }
      if (!clientQuoteRef) {
        const clientFirestore = getClientFirestore(firebase);
        clientQuoteRef = clientDoc(
          clientFirestore,
          'painters',
          normalizedPainterDocId,
          'quotes',
          normalizedQuoteId
        );
      }
      await clientUpdateDoc(clientQuoteRef, payload);
    };

    const fallbackRecordingId = String(
      quoteData?.videoEstimate?.recordingId ||
      quoteData?.signalwireRecordingId ||
      ''
    ).trim();
    const resolvedRecordingId = normalizedRecordingId || fallbackRecordingId;
    if (!resolvedRecordingId) {
      await updateQuote({
        videoEstimate: {
          status: 'missing',
          message: 'No SignalWire recording id on quote',
          updatedAt: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      });
      return NextResponse.json({
        ready: false,
        reason: 'missing-recording-id',
        source: readSource,
        adminReadError
      });
    }

    const recordingResult = await fetchRecordingUntilReady({
      recordingId: resolvedRecordingId,
      waitMs: Number(waitMs) || 7000
    });
    const nowIso = new Date().toISOString();

    if (recordingResult.ready && recordingResult.url) {
      await updateQuote({
        signalwireRecordingId: resolvedRecordingId,
        videoEstimate: {
          status: 'ready',
          message: 'Video ready',
          recordingId: resolvedRecordingId,
          url: recordingResult.url,
          updatedAt: nowIso
        },
        videoEstimates: [
          {
            type: 'signalwire',
            value: recordingResult.url,
            signalwireRecordingId: resolvedRecordingId,
            createdAt: nowIso
          }
        ],
        updatedAt: nowIso
      });
      return NextResponse.json({
        ready: true,
        recordingUrl: recordingResult.url,
        source: readSource,
        adminReadError
      });
    }

    await updateQuote({
      signalwireRecordingId: resolvedRecordingId,
      videoEstimate: {
        status: 'storing',
        message: 'Video is being stored',
        recordingId: resolvedRecordingId,
        url: recordingResult.url || null,
        updatedAt: nowIso
      },
      updatedAt: nowIso
    });
    return NextResponse.json({
      ready: false,
      recordingUrl: recordingResult.url || null,
      source: readSource,
      adminReadError
    });
  } catch (error) {
    console.error('Finalize quote recording API error:', error);
    return NextResponse.json(
      { error: 'Failed to finalize quote recording', details: (error as Error)?.message || 'unknown error' },
      { status: 500 }
    );
  }
}
