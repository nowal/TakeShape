import { NextRequest, NextResponse } from 'next/server';
import { fetchRecordingUntilReady } from '@/lib/signalwire/recordings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const search = new URL(request.url).searchParams;
    const recordingId = String(search.get('recordingId') || '').trim();
    const waitMs = Number(search.get('waitMs') || '0');

    if (!recordingId) {
      return NextResponse.json(
        { error: 'recordingId is required' },
        { status: 400 }
      );
    }

    const result = await fetchRecordingUntilReady({
      recordingId,
      waitMs: Number.isFinite(waitMs) ? Math.max(0, waitMs) : 0,
    });

    return NextResponse.json({
      ready: Boolean(result.ready && result.url),
      recordingUrl: result.url || null,
      recordingStatus: String(
        result.payload?.state || result.payload?.status || ''
      ).toLowerCase() || null,
    });
  } catch (error) {
    console.error('Quote recording URL API error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
