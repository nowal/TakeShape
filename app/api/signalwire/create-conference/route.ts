import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

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
    const { name, display_name, meta } = await request.json();

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
        size: 'small',
        quality: '720p',
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
