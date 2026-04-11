import { NextRequest, NextResponse } from 'next/server';
import { signR2DownloadUrl } from '@/lib/r2/presign';
import { getR2BucketName } from '@/lib/r2/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const objectKey = String(body.objectKey || '').trim();

    if (!objectKey) {
      return NextResponse.json(
        { error: 'objectKey is required' },
        { status: 400 }
      );
    }

    const downloadUrl = await signR2DownloadUrl(objectKey);
    return NextResponse.json({
      ok: true,
      bucket: getR2BucketName(),
      objectKey,
      downloadUrl,
    });
  } catch (error) {
    console.error('Error creating R2 download URL:', error);
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

