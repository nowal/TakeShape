import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { conference_id, room_name, to, from } = await request.json();

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
    let targetConferenceId = conference_id as string | undefined;

    if (!targetConferenceId && room_name) {
      // Backward-compatible fallback when only room_name is provided.
      const listResponse = await fetch(`https://${spaceUrl}/api/video/conferences`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Accept': 'application/json'
        }
      });

      if (!listResponse.ok) {
        const errorText = await listResponse.text();
        console.error('SignalWire list conferences error:', errorText);
        return NextResponse.json(
          { error: 'Failed to list conferences', details: errorText },
          { status: listResponse.status }
        );
      }

      const conferences = await listResponse.json();
      const conferenceList = conferences.data || conferences;
      const targetConference = conferenceList.find((c: any) => c.name === room_name);

      if (!targetConference) {
        return NextResponse.json(
          { error: `Conference "${room_name}" not found` },
          { status: 404 }
        );
      }

      targetConferenceId = targetConference.id;
    }

    if (!targetConferenceId) {
      return NextResponse.json(
        { error: 'conference_id or room_name is required' },
        { status: 400 }
      );
    }

    // Try native Video API dial first (not available in all SignalWire environments).
    const dialResponse = await fetch(`https://${spaceUrl}/api/video/conferences/${targetConferenceId}/dial`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        to: to,
        from: from
      })
    });

    if (dialResponse.ok) {
      const data = await dialResponse.json();
      return NextResponse.json(data);
    }

    const dialErrorText = await dialResponse.text();
    if (dialResponse.status !== 404) {
      console.error('SignalWire dial error:', dialErrorText);
      return NextResponse.json(
        { error: 'Failed to dial', details: dialErrorText },
        { status: dialResponse.status }
      );
    }

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
    const fallbackBody = new URLSearchParams({
      To: to,
      From: from,
      Twiml: twiml
    }).toString();

    const fallbackResponse = await fetch(
      `https://${spaceUrl}/api/laml/2010-04-01/Accounts/${projectId}/Calls.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: fallbackBody
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
      fallback: 'laml-connect-room'
    });
  } catch (error) {
    console.error('Dial API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
