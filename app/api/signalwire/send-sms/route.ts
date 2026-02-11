import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const FORCED_SMS_FROM = '+16156947135';

export async function POST(request: NextRequest) {
  try {
    const { to, body } = await request.json();
    const smsFrom = FORCED_SMS_FROM;

    if (!to || !smsFrom || !body) {
      return NextResponse.json(
        { error: 'to, body, and an SMS-capable from number are required' },
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
    const encodedBody = new URLSearchParams({
      To: to,
      From: smsFrom,
      Body: body
    }).toString();

    const response = await fetch(
      `https://${spaceUrl}/api/laml/2010-04-01/Accounts/${projectId}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: encodedBody
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SignalWire SMS error:', errorText);
      const likelyCause =
        errorText.includes('"21210"')
          ? 'The From number is voice-only or verified-caller-id. Use a purchased SMS-capable SignalWire number (set SIGNALWIRE_SMS_FROM).'
          : undefined;
      return NextResponse.json(
        { error: 'Failed to send SMS', details: errorText, likelyCause },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      sid: data.sid,
      status: data.status
    });
  } catch (error) {
    console.error('Send SMS API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
