import { NextRequest, NextResponse } from 'next/server';

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
  if (firstUrl) return firstUrl;

  return null;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const recordingId = searchParams.get('recordingId');
    const waitMs = Number(searchParams.get('waitMs') || '0');

    if (!recordingId) {
      return NextResponse.json({ error: 'recordingId is required' }, { status: 400 });
    }

    const projectId = process.env.SIGNALWIRE_PROJECT_ID?.trim();
    const apiToken = (process.env.SIGNALWIRE_API_TOKEN || process.env.SIGNALWIRE_TOKEN)?.trim();
    const spaceUrl = process.env.SIGNALWIRE_SPACE_URL?.trim().replace(/^https?:\/\//, '');

    if (!projectId || !apiToken || !spaceUrl) {
      return NextResponse.json({ error: 'SignalWire credentials not configured' }, { status: 500 });
    }

    const authHeader = Buffer.from(`${projectId}:${apiToken}`).toString('base64');
    const deadline = Date.now() + Math.max(0, waitMs);

    let lastPayload: any = null;
    while (true) {
      const response = await fetch(`https://${spaceUrl}/api/video/room_recordings/${recordingId}`, {
        method: 'GET',
        headers: {
          Authorization: `Basic ${authHeader}`,
          Accept: 'application/json'
        }
      });

      if (!response.ok) {
        const details = await response.text();
        return NextResponse.json(
          { error: 'Failed to fetch SignalWire recording', details },
          { status: response.status }
        );
      }

      const payload = await response.json();
      lastPayload = payload?.data || payload;

      const state = String(lastPayload?.state || lastPayload?.status || '').toLowerCase();
      const url = extractPlaybackUrl(lastPayload);
      const isReady = state === 'completed' || state === 'finished' || state === 'available';

      if (url && isReady) {
        return NextResponse.json({
          recording: lastPayload,
          recordingUrl: url,
          ready: true
        });
      }

      if (Date.now() >= deadline) {
        return NextResponse.json({
          recording: lastPayload,
          recordingUrl: url,
          ready: false
        });
      }

      await sleep(2000);
    }
  } catch (error) {
    console.error('SignalWire room recording API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
