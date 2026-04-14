import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import firebase from '@/lib/firebase';
import { buildQuoteVideoObjectKey } from '@/lib/r2/object-key';
import { uploadRemoteVideoToR2 } from '@/lib/r2/upload';
import { getR2BucketName } from '@/lib/r2/config';
import {
  isSupabaseDataLayerEnabled,
  shouldInlineCopySignalWireToR2,
  shouldCopySignalWireRecordingsToR2,
} from '@/lib/feature-flags';
import { upsertVideoAssetSupabase } from '@/lib/data/supabase/video-assets';
import { upsertQuoteSupabaseFromFirestore } from '@/lib/data/supabase/quotes';
import { fetchRecordingUntilReady } from '@/lib/signalwire/recordings';
import {
  doc as clientDoc,
  getDoc as clientGetDoc,
  getFirestore as getClientFirestore,
  updateDoc as clientUpdateDoc
} from 'firebase/firestore';

export const dynamic = 'force-dynamic';

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
      } else {
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
      }

      quoteData = {
        ...(quoteData || {}),
        ...payload,
      };

      if (isSupabaseDataLayerEnabled()) {
        try {
          await upsertQuoteSupabaseFromFirestore({
            providerId: normalizedPainterDocId,
            quoteId: normalizedQuoteId,
            quoteData: quoteData || {},
          });
        } catch (syncError) {
          console.error(
            'Failed to mirror quote to Supabase in finalize-recording:',
            syncError
          );
        }
      }
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
      let r2ObjectKey: string | null = null;
      let r2UploadError: string | null = null;

      if (
        shouldCopySignalWireRecordingsToR2() &&
        shouldInlineCopySignalWireToR2()
      ) {
        try {
          r2ObjectKey = buildQuoteVideoObjectKey({
            providerId: normalizedPainterDocId,
            quoteId: normalizedQuoteId,
            contentType: 'video/mp4',
            source: 'signalwire',
          });

          await uploadRemoteVideoToR2({
            sourceUrl: recordingResult.url,
            objectKey: r2ObjectKey,
            contentType: 'video/mp4',
          });
        } catch (r2Error) {
          r2UploadError =
            r2Error instanceof Error
              ? r2Error.message
              : 'R2 upload failed';
          console.error('Failed to copy SignalWire recording to R2:', r2Error);
        }
      }

      if (isSupabaseDataLayerEnabled()) {
        try {
          await upsertVideoAssetSupabase({
            quoteId: normalizedQuoteId,
            providerId: normalizedPainterDocId,
            source: 'signalwire',
            storageProvider: r2ObjectKey ? 'r2' : 'signalwire',
            bucket: r2ObjectKey ? getR2BucketName() : null,
            objectKey: r2ObjectKey,
            contentType: 'video/mp4',
            signalwireRecordingId: resolvedRecordingId,
            upstreamUrl: recordingResult.url,
            playbackUrl: recordingResult.url,
            status: r2ObjectKey ? 'ready' : 'ready_upstream_only',
            metadata: {
              ...(r2UploadError ? { r2UploadError } : {}),
              queuedForR2Copy:
                shouldCopySignalWireRecordingsToR2() &&
                !r2ObjectKey,
              source: 'finalize-recording',
            },
          });
        } catch (assetError) {
          console.error(
            'Failed to record video asset in Supabase:',
            assetError
          );
        }
      }

      const currentVideoEstimate = (quoteData?.videoEstimate || {}) as Record<string, any>;
      const existingThumbnailUrl = String(currentVideoEstimate.thumbnailUrl || '').trim() || null;
      await updateQuote({
        signalwireRecordingId: resolvedRecordingId,
        videoEstimate: {
          status: 'ready',
          message: 'Video ready',
          recordingId: resolvedRecordingId,
          url: recordingResult.url,
          r2Bucket: r2ObjectKey ? getR2BucketName() : null,
          r2ObjectKey,
          thumbnailUrl: existingThumbnailUrl,
          thumbnailStatus: existingThumbnailUrl ? 'ready' : 'pending',
          thumbnailCapturedAt: existingThumbnailUrl
            ? String(currentVideoEstimate.thumbnailCapturedAt || '').trim() || nowIso
            : null,
          thumbnailSourceSecond: Number.isFinite(Number(currentVideoEstimate.thumbnailSourceSecond))
            ? Number(currentVideoEstimate.thumbnailSourceSecond)
            : null,
          updatedAt: nowIso
        },
        videoEstimates: [
          {
            type: 'signalwire',
            value: recordingResult.url,
            r2Bucket: r2ObjectKey ? getR2BucketName() : null,
            r2ObjectKey,
            signalwireRecordingId: resolvedRecordingId,
            createdAt: nowIso
          }
        ],
        updatedAt: nowIso
      });
      return NextResponse.json({
        ready: true,
        recordingUrl: recordingResult.url,
        r2ObjectKey,
        source: readSource,
        adminReadError,
        r2UploadError
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
