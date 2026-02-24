import { NextRequest, NextResponse } from 'next/server';
import { getSignalWireConfig, resolveConference } from '@/app/api/signalwire/_lib';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { conferenceId, roomName, callSid } = await request.json();
    const config = getSignalWireConfig();

    if (!config) {
      return NextResponse.json(
        { error: 'SignalWire credentials not configured' },
        { status: 500 }
      );
    }

    let conferenceEnded = false;
    let conferenceError: string | null = null;
    const conference = await resolveConference(config, { conferenceId, roomName });

    if (conference?.id) {
      const response = await fetch(`https://${config.spaceUrl}/api/video/conferences/${conference.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Basic ${config.authHeader}`,
          Accept: 'application/json'
        }
      });

      if (response.status === 404 || response.ok) {
        conferenceEnded = true;
      } else {
        conferenceError = await response.text();
      }
    }

    const resolvedCallSid = String(
      (typeof callSid === 'string' && callSid.trim()) ||
      conference?.meta?.call_sid ||
      conference?.meta?.callSid ||
      ''
    ).trim();

    let callEnded = false;
    let callError: string | null = null;
    if (resolvedCallSid) {
      const encodedBody = new URLSearchParams({ Status: 'completed' }).toString();
      const callResponse = await fetch(
        `https://${config.spaceUrl}/api/laml/2010-04-01/Accounts/${config.projectId}/Calls/${encodeURIComponent(resolvedCallSid)}.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${config.authHeader}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json'
          },
          body: encodedBody
        }
      );
      if (callResponse.status === 404 || callResponse.ok) {
        callEnded = true;
      } else {
        callError = await callResponse.text();
      }
    }

    if (conferenceError && callError) {
      return NextResponse.json(
        {
          error: 'Failed to end conference and call',
          conferenceError,
          callError
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      conferenceEnded,
      callEnded,
      conferenceId: conference?.id || conferenceId || null
    });
  } catch (error) {
    console.error('End conference API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
