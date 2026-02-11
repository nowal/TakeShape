import { NextRequest, NextResponse } from 'next/server';

const pickToken = (tokens: any[], patterns: RegExp[]) =>
  tokens.find((t) => patterns.some((re) => re.test(String(t?.name || t?.role || t?.type || ''))));

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      );
    }

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
    
    // Get conference tokens (moderator and guest)
    const response = await fetch(`https://${spaceUrl}/api/video/conferences/${roomId}/conference_tokens`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SignalWire get tokens error:', errorText);
      return NextResponse.json(
        { error: 'Failed to get conference tokens', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    const raw = data?.data ?? data?.tokens ?? data;
    const tokens = Array.isArray(raw) ? raw : [];

    // SignalWire payloads can vary by account/features; normalize aggressively.
    let moderatorToken =
      pickToken(tokens, [/moderator/i, /host/i, /admin/i]) ||
      (data?.moderator_token ? { token: data.moderator_token, name: 'moderator' } : undefined) ||
      tokens.find((t: any) => typeof t?.token === 'string');

    let guestToken =
      pickToken(tokens, [/guest/i, /viewer/i, /participant/i]) ||
      (data?.guest_token ? { token: data.guest_token, name: 'guest' } : undefined) ||
      tokens.find((t: any) => t !== moderatorToken && typeof t?.token === 'string');

    if (!moderatorToken && guestToken) {
      moderatorToken = guestToken;
    }

    if (!guestToken && moderatorToken) {
      guestToken = moderatorToken;
    }

    return NextResponse.json({
      moderator: moderatorToken,
      guest: guestToken,
      all: tokens
    });
  } catch (error) {
    console.error('Conference tokens API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
