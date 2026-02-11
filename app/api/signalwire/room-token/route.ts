import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const {
      room_name,
      user_name,
      permissions,
      join_audio_muted,
      join_video_muted
    } = await request.json();

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
    
    const payload: Record<string, unknown> = {
      room_name,
      user_name
    };

    if (Array.isArray(permissions) && permissions.length > 0) {
      payload.permissions = permissions;
    }
    if (typeof join_audio_muted === 'boolean') {
      payload.join_audio_muted = join_audio_muted;
    }
    if (typeof join_video_muted === 'boolean') {
      payload.join_video_muted = join_video_muted;
    }

    const response = await fetch(`https://${spaceUrl}/api/video/room_tokens`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SignalWire room token error:', errorText);
      return NextResponse.json(
        { error: 'Failed to generate room token', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Room token API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
