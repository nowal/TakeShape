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

const isCallerIdVerified = (callerId: any): boolean => {
  const status = String(
    callerId?.validation_status ||
      callerId?.status ||
      ''
  ).toLowerCase();

  if (
    status.includes('validated') ||
    status === 'complete' ||
    status === 'verified' ||
    status === 'active'
  ) {
    return true;
  }

  return Boolean(
    callerId?.validated ||
      callerId?.is_verified
  );
};

const getCallerIdPhone = (callerId: any): string | null => {
  const raw = String(
    callerId?.phone_number ||
      callerId?.phoneNumber ||
      ''
  );
  return normalizeUsPhoneToE164(raw);
};

const listOutgoingCallerIds = async (
  spaceUrl: string,
  projectId: string,
  authHeader: string
) => {
  const response = await fetch(
    `https://${spaceUrl}/api/laml/2010-04-01/Accounts/${projectId}/OutgoingCallerIds.json?PageSize=100`,
    {
      method: 'GET',
      headers: {
        Authorization: `Basic ${authHeader}`,
        Accept: 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to list caller IDs: ${errorText}`
    );
  }

  const data = await response.json();
  const list =
    data?.outgoing_caller_ids ||
    data?.data ||
    [];
  return Array.isArray(list) ? list : [];
};

const triggerExistingCallerIdVerification = async (
  sid: string,
  spaceUrl: string,
  projectId: string,
  authHeader: string,
  friendlyName: string
) => {
  const body = new URLSearchParams({
    FriendlyName: friendlyName,
  }).toString();

  const response = await fetch(
    `https://${spaceUrl}/api/laml/2010-04-01/Accounts/${projectId}/OutgoingCallerIds/${sid}/ValidationRequests.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type':
          'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to trigger validation request: ${errorText}`
    );
  }

  return response.json();
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

    const existingCallerIds = await listOutgoingCallerIds(
      spaceUrl,
      projectId,
      authHeader
    );
    const existingMatch = existingCallerIds.find(
      (callerId: any) =>
        getCallerIdPhone(callerId) ===
        normalizedPhone
    );

    if (existingMatch && isCallerIdVerified(existingMatch)) {
      return NextResponse.json({
        id:
          existingMatch.sid ||
          existingMatch.id ||
          null,
        phoneNumber: normalizedPhone,
        status: 'verified',
        callSid: null,
        alreadyVerified: true,
        raw: existingMatch,
      });
    }

    if (existingMatch?.sid) {
      try {
        const validationData =
          await triggerExistingCallerIdVerification(
            existingMatch.sid,
            spaceUrl,
            projectId,
            authHeader,
            String(
              friendlyName ||
                'Painter Caller ID'
            )
          );
        return NextResponse.json({
          id:
            existingMatch.sid ||
            existingMatch.id ||
            null,
          phoneNumber: normalizedPhone,
          status: 'pending',
          callSid:
            validationData?.call_sid || null,
          alreadyVerified: false,
          reusedExisting: true,
          raw: validationData,
        });
      } catch (reuseError) {
        console.error(
          'SignalWire existing caller-id re-verify error:',
          reuseError
        );
      }
    }

    // Verified caller-id flow uses voice-call verification.
    // Create caller-id and trigger verification call through the Compatibility API.
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
      alreadyVerified: false,
      reusedExisting: false,
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
