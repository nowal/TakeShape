import { NextRequest, NextResponse } from 'next/server';
import {
  getSignalWireConfig,
  resolveConference,
} from '@/app/api/signalwire/_lib';

export const dynamic = 'force-dynamic';

const normalizeValue = (value: unknown) =>
  String(value || '').trim();

const normalizeCallStatus = (value: unknown) =>
  normalizeValue(value).toLowerCase();

const normalizeAnsweredBy = (value: unknown) =>
  normalizeValue(value).toLowerCase();

const isVoicemailAnsweredBy = (value: string) =>
  value.startsWith('machine') || value.includes('voicemail');

const updateConferenceMeta = async ({
  conferenceId,
  roomName,
  metaPatch,
}: {
  conferenceId?: string | null;
  roomName?: string | null;
  metaPatch: Record<string, unknown>;
}) => {
  const config = getSignalWireConfig();
  if (!config) {
    throw new Error('SignalWire credentials not configured');
  }

  const conference = await resolveConference(config, {
    conferenceId,
    roomName,
  });
  if (!conference?.id) {
    throw new Error('Conference not found for callback');
  }

  const nextMeta = {
    ...(conference.meta || {}),
    ...metaPatch,
  };
  const currentMode = String(
    conference?.meta?.call_mode ||
      conference?.meta?.callMode ||
      'live'
  )
    .trim()
    .toLowerCase() || 'live';
  const nextDescription = `call_mode:${currentMode};updated_at:${new Date().toISOString()}`;

  const attemptUpdate = async (method: 'PATCH' | 'PUT') =>
    fetch(`https://${config.spaceUrl}/api/video/conferences/${conference.id}`, {
      method,
      cache: 'no-store',
      headers: {
        Authorization: `Basic ${config.authHeader}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        meta: nextMeta,
        description: nextDescription,
      }),
    });

  let swResponse = await attemptUpdate('PATCH');
  if (!swResponse.ok) {
    swResponse = await attemptUpdate('PUT');
  }

  if (!swResponse.ok) {
    const errorText = await swResponse.text();
    throw new Error(`Failed to update conference from callback: ${errorText}`);
  }
};

export async function POST(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const conferenceId = requestUrl.searchParams.get('conferenceId');
    const roomName = requestUrl.searchParams.get('roomName');

    const formData = await request.formData().catch(() => null);
    const body = formData
      ? Object.fromEntries(formData.entries())
      : await request.json().catch(() => ({}));

    const callSid = normalizeValue(
      body.CallSid ?? body.callSid ?? body.call_sid
    );
    const callStatus = normalizeCallStatus(
      body.CallStatus ?? body.callStatus ?? body.call_status
    );
    const answeredBy = normalizeAnsweredBy(
      body.AnsweredBy ?? body.answeredBy ?? body.answered_by
    );

    console.log('signalwire call-events callback', {
      conferenceId,
      roomName,
      callSid: callSid || null,
      callStatus: callStatus || null,
      answeredBy: answeredBy || null,
      body,
    });

    if (!conferenceId && !roomName) {
      return NextResponse.json(
        { error: 'conferenceId or roomName is required' },
        { status: 400 }
      );
    }

    await updateConferenceMeta({
      conferenceId,
      roomName,
      metaPatch: {
        call_sid: callSid || undefined,
        pstn_call_status: callStatus || undefined,
        call_answered_by: answeredBy || undefined,
        voicemail_detected: answeredBy
          ? isVoicemailAnsweredBy(answeredBy)
          : undefined,
        pstn_callback_at: new Date().toISOString(),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('SignalWire call-events callback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
