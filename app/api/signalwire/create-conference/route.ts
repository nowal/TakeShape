import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { name, display_name } = await request.json();

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
    const response = await fetch(`https://${spaceUrl}/api/video/conferences`, {
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
        record_on_start: false
      })
    });

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
    return NextResponse.json({
      ...data,
      space_url: spaceUrl
    });
  } catch (error) {
    console.error('Create conference API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
