import { NextRequest, NextResponse } from 'next/server';
import { getSignalWireConfig, resolveConference } from '@/app/api/signalwire/_lib';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conferenceId = searchParams.get('conferenceId');
    const roomName = searchParams.get('roomName');

    if (!conferenceId && !roomName) {
      return NextResponse.json(
        { error: 'conferenceId or roomName is required' },
        { status: 400 }
      );
    }

    const config = getSignalWireConfig();
    if (!config) {
      return NextResponse.json(
        { error: 'SignalWire credentials not configured' },
        { status: 500 }
      );
    }

    const conference = await resolveConference(config, { conferenceId, roomName });
    if (!conference) {
      return NextResponse.json({
        exists: false
      });
    }

    return NextResponse.json({
      exists: true,
      conferenceId: conference.id || null,
      roomName: conference.name || null,
      mode: conference?.meta?.call_mode || 'live',
      meta: conference?.meta || {}
    });
  } catch (error) {
    console.error('Conference state API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { conferenceId, roomName, mode, metaPatch } = await request.json();
    if (!conferenceId && !roomName) {
      return NextResponse.json(
        { error: 'conferenceId or roomName is required' },
        { status: 400 }
      );
    }
    if (
      (typeof mode !== 'string' || !mode.trim()) &&
      (!metaPatch || typeof metaPatch !== 'object')
    ) {
      return NextResponse.json(
        { error: 'mode or metaPatch is required' },
        { status: 400 }
      );
    }

    const config = getSignalWireConfig();
    if (!config) {
      return NextResponse.json(
        { error: 'SignalWire credentials not configured' },
        { status: 500 }
      );
    }

    const conference = await resolveConference(config, { conferenceId, roomName });
    if (!conference?.id) {
      return NextResponse.json(
        { error: 'Conference not found' },
        { status: 404 }
      );
    }

    const response = await fetch(`https://${config.spaceUrl}/api/video/conferences/${conference.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Basic ${config.authHeader}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        meta: {
          ...(conference.meta || {}),
          ...(typeof mode === 'string' && mode.trim()
            ? { call_mode: mode.trim() }
            : {}),
          ...(metaPatch && typeof metaPatch === 'object' ? metaPatch : {})
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'Failed to update conference mode', details: errorText },
        { status: response.status }
      );
    }

    const payload = await response.json();
    const updated = payload?.data ?? payload;
    return NextResponse.json({
      exists: true,
      conferenceId: updated?.id || conference.id,
      roomName: updated?.name || conference.name || null,
      mode: updated?.meta?.call_mode || (typeof mode === 'string' ? mode.trim() : 'live'),
      meta: updated?.meta || {}
    });
  } catch (error) {
    console.error('Conference mode update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
