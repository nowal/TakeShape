import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const ALLOWED_ROOM_QUALITIES = new Set(['720p', '1080p']);
const ALLOWED_ROOM_SIZES = new Set(['small', 'medium', 'large']);

const normalizeRoomQuality = (value: unknown) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (ALLOWED_ROOM_QUALITIES.has(normalized)) return normalized;
  return null;
};

const normalizeRoomSize = (value: unknown) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (ALLOWED_ROOM_SIZES.has(normalized)) return normalized;
  return null;
};

const fetchWithTimeout = async (url: string, init: RequestInit, timeoutMs = 15000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
};

export async function POST(request: NextRequest) {
  try {
    const { name, display_name, meta, quality, size } = await request.json();

    const projectId = process.env.SIGNALWIRE_PROJECT_ID?.trim();
    const apiToken = (process.env.SIGNALWIRE_API_TOKEN || process.env.SIGNALWIRE_TOKEN)?.trim();
    const spaceUrl = process.env.SIGNALWIRE_SPACE_URL?.trim().replace(/^https?:\/\//, '');

    if (!projectId || !apiToken || !spaceUrl) {
      return NextResponse.json(
        { error: 'SignalWire credentials not configured' },
        { status: 500 }
      );
    }

    const authHeader = Buffer.from(`${projectId}:${apiToken}`).toString('base64');
    const defaultQuality =
      normalizeRoomQuality(process.env.SIGNALWIRE_DEFAULT_VIDEO_QUALITY) || '1080p';
    const defaultSize =
      normalizeRoomSize(process.env.SIGNALWIRE_DEFAULT_ROOM_SIZE) || 'medium';
    const roomQuality = normalizeRoomQuality(quality) || defaultQuality;
    const roomSize = normalizeRoomSize(size) || defaultSize;
    
    // Create a Video Conference (room with UI)
    const response = await fetchWithTimeout(`https://${spaceUrl}/api/video/conferences`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: name || `quote-session-${Date.now()}`,
        display_name: display_name || 'Quote Call',
        size: roomSize,
        quality: roomQuality,
        layout: 'grid-responsive',
        enable_room_previews: true,
        enable_chat: true,
        tone_on_entry_and_exit: false,
        user_join_video_off: false,
        room_join_video_off: false,
        ...(meta && typeof meta === 'object' ? { meta } : {}),
        record_on_start: false
      })
    }, 15000);

    if (!response.ok) {
      const errorText = await response.text();
      const likelyCause =
        response.status === 401
          ? 'Unauthorized: verify SIGNALWIRE_PROJECT_ID + API token and ensure the token has Video scope.'
          : 'SignalWire rejected the request.';
      console.error('SignalWire create conference error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to create conference', details: errorText, likelyCause },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Some spaces can ignore create-time flags; enforce tone/video defaults.
    if (
      data?.id &&
      (
        data?.tone_on_entry_and_exit !== false ||
        data?.user_join_video_off !== false ||
        data?.room_join_video_off !== false
      )
    ) {
      try {
        const patchResponse = await fetchWithTimeout(`https://${spaceUrl}/api/video/conferences/${data.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Basic ${authHeader}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            tone_on_entry_and_exit: false,
            user_join_video_off: false,
            room_join_video_off: false
          })
        }, 10000);

        if (patchResponse.ok) {
          const patched = await patchResponse.json();
          return NextResponse.json({
            ...patched,
            space_url: spaceUrl
          });
        }
      } catch (patchError) {
        console.error('SignalWire conference tone patch failed:', patchError);
      }
    }

    return NextResponse.json({
      ...data,
      space_url: spaceUrl
    });
  } catch (error) {
    const message =
      (error as Error)?.name === 'AbortError'
        ? 'SignalWire request timed out while creating conference'
        : 'Internal server error';
    console.error('Create conference API error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
