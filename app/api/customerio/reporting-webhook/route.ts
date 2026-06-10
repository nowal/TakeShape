import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  getCustomerIoDefaultProviderId,
  getCustomerIoReportingWebhookSigningKey,
} from '@/lib/customerio/config';
import { getTakeShapeAppSupabaseServer } from '@/lib/supabase/takeshape-app-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type CustomerIoWebhookBody = {
  event_id?: string;
  object_type?: string;
  metric?: string;
  timestamp?: number;
  data?: {
    action_id?: number | string;
    broadcast_id?: number | string;
    campaign_id?: number | string;
    customer_id?: string;
    delivery_id?: string;
    email_address?: string;
    identifiers?: {
      cio_id?: string | null;
      email?: string | null;
      id?: string | null;
    };
    newsletter_id?: number | string;
    recipient?: string;
    subject?: string;
  };
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const toStringValue = (value: unknown) =>
  value === null || value === undefined ? '' : String(value).trim();

const fromUnixSeconds = (value: number | undefined) =>
  Number.isFinite(value)
    ? new Date(Number(value) * 1000).toISOString()
    : new Date().toISOString();

const getSignaturePayload = (timestamp: string, rawBody: string) =>
  `v0:${timestamp}:${rawBody}`;

const verifySignature = ({
  rawBody,
  signature,
  timestamp,
}: {
  rawBody: string;
  signature: string;
  timestamp: string;
}) => {
  const signingKey = getCustomerIoReportingWebhookSigningKey();
  if (!signingKey) {
    return process.env.NODE_ENV !== 'production' ||
      process.env.CUSTOMER_IO_ALLOW_UNSIGNED_WEBHOOKS === 'true';
  }

  if (!signature || !timestamp) return false;

  const expected = createHmac('sha256', signingKey)
    .update(getSignaturePayload(timestamp, rawBody))
    .digest('hex');

  const expectedBuffer = Buffer.from(expected, 'hex');
  const signatureBuffer = Buffer.from(signature, 'hex');
  return (
    expectedBuffer.length === signatureBuffer.length &&
    timingSafeEqual(expectedBuffer, signatureBuffer)
  );
};

const resolveHomeownerLead = async ({
  customerId,
  email,
}: {
  customerId: string;
  email: string;
}) => {
  const supabase = getTakeShapeAppSupabaseServer();

  if (uuidPattern.test(customerId)) {
    const { data, error } = await supabase
      .from('provider_sourced_homeowner_leads')
      .select('id,provider_id')
      .eq('id', customerId)
      .maybeSingle();

    if (!error && data) {
      return {
        homeownerLeadId: data.id as string,
        providerId: data.provider_id as string,
      };
    }
  }

  if (email) {
    const { data, error } = await supabase
      .from('provider_sourced_homeowner_leads')
      .select('id,provider_id')
      .eq('email', email)
      .limit(1);

    if (!error && data?.[0]) {
      return {
        homeownerLeadId: data[0].id as string,
        providerId: data[0].provider_id as string,
      };
    }
  }

  return {
    homeownerLeadId: null,
    providerId: getCustomerIoDefaultProviderId() || null,
  };
};

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-cio-signature') || '';
    const timestamp = request.headers.get('x-cio-timestamp') || '';

    if (!verifySignature({ rawBody, signature, timestamp })) {
      return NextResponse.json(
        { ok: false, error: 'Invalid Customer.io signature' },
        { status: 401 }
      );
    }

    const body = JSON.parse(rawBody) as CustomerIoWebhookBody;
    const data = body.data || {};
    const identifiers = data.identifiers || {};
    const recipient = toStringValue(data.recipient || data.email_address);
    const email =
      toStringValue(identifiers.email) ||
      (recipient.includes('@') ? recipient : '');
    const customerId =
      toStringValue(identifiers.id) || toStringValue(data.customer_id);
    const resolved = await resolveHomeownerLead({ customerId, email });
    const providerId = resolved.providerId || getCustomerIoDefaultProviderId();

    if (!providerId) {
      return NextResponse.json(
        { ok: false, error: 'Could not resolve provider for event' },
        { status: 422 }
      );
    }

    const objectType = toStringValue(body.object_type) || 'customer_io';
    const metric = toStringValue(body.metric) || 'event';
    const eventType = `${objectType}_${metric}`;

    const payload = {
      provider_id: providerId,
      homeowner_lead_id: resolved.homeownerLeadId,
      homeowner_identity_key: customerId || email || recipient || null,
      source_system: 'customer_io',
      event_type: eventType,
      channel: objectType,
      external_event_id: toStringValue(body.event_id) || null,
      external_delivery_id: toStringValue(data.delivery_id) || null,
      external_customer_id: customerId || null,
      customer_io_cio_id: toStringValue(identifiers.cio_id) || null,
      customer_io_campaign_id: toStringValue(data.campaign_id) || null,
      customer_io_action_id: toStringValue(data.action_id) || null,
      customer_io_broadcast_id: toStringValue(data.broadcast_id) || null,
      customer_io_newsletter_id: toStringValue(data.newsletter_id) || null,
      recipient: recipient || null,
      subject: toStringValue(data.subject) || null,
      occurred_at: fromUnixSeconds(body.timestamp),
      raw_payload: body as Record<string, unknown>,
    };

    const { error } = await getTakeShapeAppSupabaseServer()
      .from('provider_homeowner_engagement_events')
      .upsert(payload, {
        onConflict: 'source_system,external_event_id',
      });

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      eventType,
      providerId,
      homeownerLeadId: resolved.homeownerLeadId,
    });
  } catch (error) {
    console.error('Customer.io reporting webhook error:', error);
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
