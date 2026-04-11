import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { buildQuoteVideoObjectKey } from '@/lib/r2/object-key';
import { signR2UploadUrl } from '@/lib/r2/presign';
import { getR2BucketName } from '@/lib/r2/config';
import { isSupabaseDataLayerEnabled } from '@/lib/feature-flags';
import { upsertVideoAssetSupabase } from '@/lib/data/supabase/video-assets';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const providerId = String(
      body.providerId || body.painterId || ''
    ).trim();
    const quoteId = String(body.quoteId || '').trim();
    const contentType = String(
      body.contentType || 'video/mp4'
    ).trim();

    if (!providerId || !quoteId) {
      return NextResponse.json(
        { error: 'providerId and quoteId are required' },
        { status: 400 }
      );
    }

    const objectKey = buildQuoteVideoObjectKey({
      providerId,
      quoteId,
      contentType,
      source: 'upload',
    });
    const uploadUrl = await signR2UploadUrl({
      key: objectKey,
      contentType,
    });
    const assetId = randomUUID();

    if (isSupabaseDataLayerEnabled()) {
      await upsertVideoAssetSupabase({
        id: assetId,
        quoteId,
        providerId,
        source: 'upload',
        storageProvider: 'r2',
        bucket: getR2BucketName(),
        objectKey,
        contentType,
        status: 'upload_url_issued',
      });
    }

    return NextResponse.json({
      ok: true,
      assetId,
      bucket: getR2BucketName(),
      objectKey,
      contentType,
      uploadUrl,
      method: 'PUT',
    });
  } catch (error) {
    console.error('Error creating R2 upload URL:', error);
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
