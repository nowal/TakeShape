import { randomUUID } from 'crypto';
import { supabaseServer } from '@/lib/supabase/server';

export const upsertVideoAssetSupabase = async ({
  id,
  quoteId,
  providerId,
  source,
  storageProvider,
  bucket,
  objectKey,
  contentType,
  fileSizeBytes,
  signalwireRecordingId,
  upstreamUrl,
  playbackUrl,
  status,
  metadata,
}: {
  id?: string;
  quoteId?: string | null;
  providerId?: string | null;
  source: 'upload' | 'signalwire';
  storageProvider: 'r2' | 'signalwire' | 'firebase';
  bucket?: string | null;
  objectKey?: string | null;
  contentType?: string | null;
  fileSizeBytes?: number | null;
  signalwireRecordingId?: string | null;
  upstreamUrl?: string | null;
  playbackUrl?: string | null;
  status: string;
  metadata?: Record<string, unknown>;
}) => {
  const rowId = id || randomUUID();
  const payload = {
    id: rowId,
    quote_id: quoteId || null,
    provider_id: providerId || null,
    source,
    storage_provider: storageProvider,
    bucket: bucket || null,
    object_key: objectKey || null,
    content_type: contentType || null,
    file_size_bytes:
      Number.isFinite(fileSizeBytes) && fileSizeBytes
        ? Math.round(fileSizeBytes)
        : null,
    signalwire_recording_id: signalwireRecordingId || null,
    upstream_url: upstreamUrl || null,
    playback_url: playbackUrl || null,
    status,
    metadata: metadata || {},
  };

  const { error } = await supabaseServer
    .from('video_assets')
    .upsert(payload, {
      onConflict: 'id',
    });

  if (error) throw error;
  return rowId;
};

