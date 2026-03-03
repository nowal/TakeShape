import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const {
      conference_id,
      room_name,
      to,
      from,
      machine_detection
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
    const useMachineDetection = machine_detection !== false;
    const requestUrl = new URL(request.url);
    const appBase =
      process.env.NEXT_PUBLIC_PUBLIC_APP_URL?.trim() ||
      process.env.NEXT_PUBLIC_BASE_URL?.trim() ||
      `${requestUrl.protocol}//${requestUrl.host}`;

    if (!room_name) {
      return NextResponse.json(
        { error: 'room_name is required for fallback dialing' },
        { status: 400 }
      );
    }

    // Fallback: create a PSTN call and connect that leg to the Video Room via cXML.
    const twiml =
      `<?xml version="1.0" encoding="UTF-8"?>` +
      `<Response><Connect><Room>${room_name}</Room></Connect></Response>`;
    const callbackUrl = new URL('/api/signalwire/call-events', appBase);
    if (conference_id) {
      callbackUrl.searchParams.set(
        'conferenceId',
        String(conference_id)
      );
    }
    if (room_name) {
      callbackUrl.searchParams.set('roomName', String(room_name));
    }

    const requestBody = new URLSearchParams({
      To: to,
      From: from,
      Twiml: twiml,
      StatusCallback: callbackUrl.toString(),
      StatusCallbackEvent: 'completed'
    });
    if (useMachineDetection) {
      requestBody.set('MachineDetection', 'DetectMessageEnd');
      requestBody.set('AsyncAmd', 'true');
      requestBody.set(
        'AsyncAmdStatusCallback',
        callbackUrl.toString()
      );
    }

    const fallbackResponse = await fetch(
      `https://${spaceUrl}/api/laml/2010-04-01/Accounts/${projectId}/Calls.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: requestBody.toString()
      }
    );

    if (!fallbackResponse.ok) {
      const errorText = await fallbackResponse.text();
      console.error('SignalWire fallback dial error:', errorText);
      return NextResponse.json(
        {
          error: 'Failed to dial',
          details: errorText,
          likelyCause: 'Video dial endpoint returned 404 and fallback call creation failed.'
        },
        { status: fallbackResponse.status }
      );
    }

    const fallbackData = await fallbackResponse.json();
    return NextResponse.json({
      ...fallbackData,
      fallback: 'laml-connect-room',
      machineDetection: useMachineDetection ? 'DetectMessageEnd' : 'disabled'
    });
  } catch (error) {
    console.error('Dial API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
