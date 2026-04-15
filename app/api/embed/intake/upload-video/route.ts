import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminStorageBucket } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const sanitizeSegment = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const extensionFromType = (contentType: string) => {
  const normalized = String(contentType || '').toLowerCase();
  if (normalized.includes('quicktime')) return 'mov';
  if (normalized.includes('webm')) return 'webm';
  if (normalized.includes('mpeg')) return 'mpeg';
  if (normalized.includes('mp4')) return 'mp4';
  return 'mp4';
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const providerId = String(formData.get('providerId') || '').trim();
    const file = formData.get('video');

    if (!providerId) {
      return NextResponse.json(
        { ok: false, error: 'providerId is required' },
        { status: 400 }
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: 'video file is required' },
        { status: 400 }
      );
    }

    const contentType = String(file.type || '').trim();
    if (!contentType.startsWith('video/')) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid file type. Please upload a video file.',
        },
        { status: 400 }
      );
    }

    const extension = extensionFromType(contentType);
    const safeProviderId = sanitizeSegment(providerId) || 'provider';
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const objectKey = `intake-videos/providers/${safeProviderId}/${year}/${month}/${randomUUID()}.${extension}`;

    const bytes = Buffer.from(await file.arrayBuffer());
    const bucket = getAdminStorageBucket();
    const storageFile = bucket.file(objectKey);
    await storageFile.save(bytes, {
      contentType,
      resumable: false,
      metadata: {
        cacheControl: 'private, max-age=0, no-transform',
      },
    });

    const [downloadUrl] = await storageFile.getSignedUrl({
      action: 'read',
      // 7-day signed link is enough for provider follow-up.
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    return NextResponse.json({
      ok: true,
      objectKey,
      fileName: file.name,
      contentType,
      downloadUrl,
    });
  } catch (error) {
    console.error('Error uploading embed intake video:', error);
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
