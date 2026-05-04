import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const toRecord = (value: unknown) =>
  value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const providerId = String(body?.providerId || '').trim();
    const quoteIdRaw = String(body?.quoteId || '').trim();
    const metadataPatch = toRecord(body?.metadataPatch);
    const pricingPatch = toRecord(body?.pricingPatch);
    const customerPatch = toRecord(body?.customerInfoPatch);
    const signalwireConferenceId = body?.signalwireConferenceId ?? undefined;
    const signalwireRecordingId = body?.signalwireRecordingId ?? undefined;
    const status = body?.status ?? undefined;

    if (!providerId) {
      return NextResponse.json(
        { error: 'providerId is required' },
        { status: 400 }
      );
    }

    const quoteId = quoteIdRaw || crypto.randomUUID();
    const { data: current, error: currentError } = await supabaseServer
      .from('quotes')
      .select('*')
      .eq('id', quoteId)
      .eq('provider_id', providerId)
      .maybeSingle();
    if (currentError) throw currentError;

    const currentPricing = toRecord(current?.pricing);
    const currentCustomer = toRecord(current?.customer_info);
    const currentMetadata = toRecord(current?.metadata);

    const payload = {
      id: quoteId,
      provider_id: providerId,
      signalwire_conference_id:
        signalwireConferenceId !== undefined
          ? signalwireConferenceId
          : current?.signalwire_conference_id || null,
      signalwire_recording_id:
        signalwireRecordingId !== undefined
          ? signalwireRecordingId
          : current?.signalwire_recording_id || null,
      status:
        String(status || current?.status || '').trim() ||
        'draft',
      pricing: {
        ...currentPricing,
        ...pricingPatch,
      },
      customer_info: {
        ...currentCustomer,
        ...customerPatch,
      },
      metadata: {
        ...currentMetadata,
        ...metadataPatch,
      },
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabaseServer
      .from('quotes')
      .upsert(payload, { onConflict: 'id' });
    if (error) throw error;

    return NextResponse.json({ ok: true, quoteId });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
