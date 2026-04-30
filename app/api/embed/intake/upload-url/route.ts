import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminStorageBucket } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_VIDEO_BYTES = 500 * 1024 * 1024; // 500MB

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
    const body = await request.json();
    const providerId = String(body?.providerId || '').trim();
    const fileName = String(body?.fileName || '').trim();
    const contentType = String(body?.contentType || '').trim();
    const fileSize = Number(body?.fileSize || 0);

    if (!providerId) {
      return NextResponse.json(
        { ok: false, error: 'providerId is required' },
        { status: 400 }
      );
    }

    if (!fileName) {
      return NextResponse.json(
        { ok: false, error: 'fileName is required' },
        { status: 400 }
      );
    }

    if (!contentType.startsWith('video/')) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid file type. Please upload a video file.',
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(fileSize) || fileSize <= 0) {
      return NextResponse.json(
        { ok: false, error: 'Invalid file size.' },
        { status: 400 }
      );
    }

    if (fileSize > MAX_VIDEO_BYTES) {
      return NextResponse.json(
        {
          ok: false,
          error: 'File is too large. Maximum size is 500MB.',
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

    const bucket = getAdminStorageBucket();
    const storageFile = bucket.file(objectKey);

    const [uploadUrl] = await storageFile.getSignedUrl({
      version: 'v4',
      action: 'write',
      contentType,
      expires: Date.now() + 15 * 60 * 1000,
    });

    const [downloadUrl] = await storageFile.getSignedUrl({
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    return NextResponse.json({
      ok: true,
      objectKey,
      uploadUrl,
      downloadUrl,
      contentType,
      fileName,
      maxBytes: MAX_VIDEO_BYTES,
    });
  } catch (error) {
    console.error('Error creating embed intake upload URL:', error);
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
