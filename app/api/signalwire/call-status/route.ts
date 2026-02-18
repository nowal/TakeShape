import { NextRequest, NextResponse } from 'next/server';
import { getSignalWireConfig } from '@/app/api/signalwire/_lib';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const callSid = searchParams.get('callSid');

    if (!callSid) {
      return NextResponse.json(
        { error: 'callSid is required' },
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

    const response = await fetch(
      `https://${config.spaceUrl}/api/laml/2010-04-01/Accounts/${config.projectId}/Calls/${encodeURIComponent(callSid)}.json`,
      {
        method: 'GET',
        headers: {
          Authorization: `Basic ${config.authHeader}`,
          Accept: 'application/json'
        }
      }
    );

    if (response.status === 404) {
      return NextResponse.json({
        exists: false,
        callSid,
        status: 'not_found',
        completed: true
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'Failed to fetch call status', details: errorText },
        { status: response.status }
      );
    }

    const payload = await response.json();
    const status = String(payload?.status || '').toLowerCase();
    const completedStates = new Set([
      'completed',
      'busy',
      'failed',
      'no-answer',
      'canceled'
    ]);

    return NextResponse.json({
      exists: true,
      callSid: payload?.sid || callSid,
      status: status || 'unknown',
      completed: completedStates.has(status),
      raw: payload
    });
  } catch (error) {
    console.error('Call status API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

