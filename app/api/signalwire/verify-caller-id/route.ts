import { NextRequest, NextResponse } from 'next/server';
import { normalizeUsPhoneToE164 } from '@/utils/phone';

export const dynamic = 'force-dynamic';

const getSignalWireConfig = () => {
  const projectId = process.env.SIGNALWIRE_PROJECT_ID?.trim();
  const apiToken = (process.env.SIGNALWIRE_API_TOKEN || process.env.SIGNALWIRE_TOKEN)?.trim();
  const spaceUrl = process.env.SIGNALWIRE_SPACE_URL?.trim().replace(/^https?:\/\//, '');

  if (!projectId || !apiToken || !spaceUrl) {
    return null;
  }

  const authHeader = Buffer.from(`${projectId}:${apiToken}`).toString('base64');
  return { projectId, apiToken, spaceUrl, authHeader };
};

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, friendlyName } = await request.json();
    const normalizedPhone = normalizeUsPhoneToE164(String(phoneNumber || ''));

    if (!normalizedPhone) {
      return NextResponse.json(
        { error: 'Invalid US phone number' },
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

    const { projectId, spaceUrl, authHeader } = config;

    // Verified caller-id flow in SignalWire uses voice-call verification.
    // Trigger the verification call through the Compatibility API.
    const form = new URLSearchParams({
      PhoneNumber: normalizedPhone,
      FriendlyName: String(friendlyName || 'Painter Caller ID')
    }).toString();

    const response = await fetch(
      `https://${spaceUrl}/api/laml/2010-04-01/Accounts/${projectId}/OutgoingCallerIds.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: form
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SignalWire verify caller-id error:', errorText);
      return NextResponse.json(
        {
          error: 'Failed to start caller ID verification',
          details: errorText
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      id: data.sid || data.id || null,
      phoneNumber: data.phone_number || normalizedPhone,
      status: data.validation_status || data.status || 'pending',
      callSid: data.call_sid || null,
      raw: data
    });
  } catch (error) {
    console.error('Verify caller-id API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

