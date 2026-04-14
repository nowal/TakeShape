import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { fetchRecordingUntilReady } from '@/lib/signalwire/recordings';
import { buildQuoteVideoObjectKey } from '@/lib/r2/object-key';
import { uploadRemoteVideoToR2 } from '@/lib/r2/upload';
import { getR2BucketName } from '@/lib/r2/config';
import { upsertVideoAssetSupabase } from '@/lib/data/supabase/video-assets';
import { shouldCopySignalWireRecordingsToR2 } from '@/lib/feature-flags';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const isAuthorized = (request: NextRequest) => {
  const cronSecret = process.env.CRON_SECRET?.trim();
  const authHeader = request.headers.get('authorization') || '';
  const bearerToken = authHeader.replace(/^Bearer\s+/i, '').trim();
  const isVercelCronRequest = Boolean(
    request.headers.get('x-vercel-cron')
  );

  if (cronSecret && bearerToken === cronSecret) {
    return true;
  }

  // Accept Vercel's internal cron requests when no explicit secret check is possible.
  if (isVercelCronRequest) {
    return true;
  }

  return false;
};

const hasR2ObjectKey = (metadata: Record<string, any>) => {
  const videoEstimate = (metadata?.videoEstimate || {}) as Record<
    string,
    any
  >;
  return Boolean(String(videoEstimate.r2ObjectKey || '').trim());
};

const run = async (request: NextRequest) => {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!shouldCopySignalWireRecordingsToR2()) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: 'COPY_SIGNALWIRE_RECORDINGS_TO_R2 is disabled',
    });
  }

  try {
    const limitParam = Number(
      new URL(request.url).searchParams.get('limit') || '200'
    );
    const limit = Number.isFinite(limitParam)
      ? Math.max(1, Math.min(Math.floor(limitParam), 500))
      : 200;

    const { data: quotes, error } = await supabaseServer
      .from('quotes')
      .select('id,provider_id,signalwire_recording_id,metadata')
      .not('signalwire_recording_id', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    const candidates = (quotes || []).filter((quote) => {
      const metadata = (quote.metadata || {}) as Record<string, any>;
      return !hasR2ObjectKey(metadata);
    });

    let copied = 0;
    let pending = 0;
    let failed = 0;
    const failures: Array<{ quoteId: string; error: string }> = [];

    for (const quote of candidates) {
      const quoteId = String(quote.id || '').trim();
      const providerId = String(quote.provider_id || '').trim();
      const recordingId = String(
        quote.signalwire_recording_id || ''
      ).trim();
      const metadata = (quote.metadata || {}) as Record<string, any>;

      if (!quoteId || !providerId || !recordingId) continue;

      try {
        const recording = await fetchRecordingUntilReady({
          recordingId,
          waitMs: 0,
        });

        if (!recording.ready || !recording.url) {
          pending += 1;
          await upsertVideoAssetSupabase({
            quoteId,
            providerId,
            source: 'signalwire',
            storageProvider: 'signalwire',
            signalwireRecordingId: recordingId,
            upstreamUrl: recording.url || null,
            playbackUrl: recording.url || null,
            status: 'ready_upstream_only',
            metadata: {
              source: 'nightly-reconcile',
              reason: 'recording-not-ready',
            },
          });
          continue;
        }

        const objectKey = buildQuoteVideoObjectKey({
          providerId,
          quoteId,
          contentType: 'video/mp4',
          source: 'signalwire',
        });

        await uploadRemoteVideoToR2({
          sourceUrl: recording.url,
          objectKey,
          contentType: 'video/mp4',
        });

        const nextMetadata = {
          ...metadata,
          videoEstimate: {
            ...(metadata.videoEstimate || {}),
            status: 'ready',
            message: 'Video ready',
            recordingId,
            url: recording.url,
            r2Bucket: getR2BucketName(),
            r2ObjectKey: objectKey,
            updatedAt: new Date().toISOString(),
          },
        };

        const { error: updateError } = await supabaseServer
          .from('quotes')
          .update({
            signalwire_recording_id: recordingId,
            metadata: nextMetadata,
          })
          .eq('id', quoteId)
          .eq('provider_id', providerId);

        if (updateError) throw updateError;

        await upsertVideoAssetSupabase({
          quoteId,
          providerId,
          source: 'signalwire',
          storageProvider: 'r2',
          bucket: getR2BucketName(),
          objectKey,
          contentType: 'video/mp4',
          signalwireRecordingId: recordingId,
          upstreamUrl: recording.url,
          playbackUrl: recording.url,
          status: 'ready',
          metadata: {
            source: 'nightly-reconcile',
          },
        });

        copied += 1;
      } catch (reconcileError) {
        failed += 1;
        failures.push({
          quoteId,
          error:
            reconcileError instanceof Error
              ? reconcileError.message
              : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      ok: true,
      scanned: candidates.length,
      copied,
      pending,
      failed,
      failures: failures.slice(0, 20),
    });
  } catch (error) {
    console.error('Quote recording reconcile error:', error);
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
};

export async function POST(request: NextRequest) {
  return run(request);
}

export async function GET(request: NextRequest) {
  return run(request);
}
