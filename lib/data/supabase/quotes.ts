import { supabaseServer } from '@/lib/supabase/server';

type QuotePricingRow = {
  item: string;
  description: string;
  price: number;
};

type SupabaseQuoteRow = {
  id: string;
  provider_id: string;
  session_id: string | null;
  homeowner_id: string | null;
  house_id: string | null;
  signalwire_conference_id: string | null;
  signalwire_recording_id: string | null;
  status: string;
  pricing: Record<string, unknown>;
  customer_info: Record<string, unknown>;
  signature: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

const toIso = (value: unknown, fallbackIso: string) => {
  if (!value) return fallbackIso;
  const seconds = Number((value as { seconds?: number })?.seconds);
  if (Number.isFinite(seconds) && seconds > 0) {
    return new Date(seconds * 1000).toISOString();
  }
  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    const millis =
      numeric > 1e12 ? numeric : numeric > 1e9 ? numeric * 1000 : numeric;
    const parsed = new Date(millis);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }
  const parsed = new Date(String(value));
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }
  return fallbackIso;
};

const normalizePricing = (rawPricing: unknown) => {
  const pricing = (rawPricing || {}) as Record<string, unknown>;
  const rowsRaw = Array.isArray(pricing.rows) ? pricing.rows : [];
  const rows: QuotePricingRow[] = rowsRaw.map((row) => {
    const cast = (row || {}) as Record<string, unknown>;
    return {
      item: String(cast.item || ''),
      description: String(cast.description || ''),
      price: Number(cast.price) || 0,
    };
  });
  const totalPrice = Number(pricing.totalPrice);
  return {
    rows,
    totalPrice: Number.isFinite(totalPrice)
      ? totalPrice
      : rows.reduce((sum, row) => sum + row.price, 0),
    submittedAt: pricing.submittedAt || null,
    updatedAt: pricing.updatedAt || null,
  };
};

const inferStatus = (quoteData: Record<string, any>) => {
  if (quoteData.quoteAccepted || quoteData.quoteAcceptedAt) {
    return 'accepted';
  }
  const rows = Array.isArray(quoteData?.pricing?.rows)
    ? quoteData.pricing.rows
    : [];
  if (rows.length) return 'submitted';
  return 'draft';
};

export const mapFirestoreQuoteToSupabaseRow = ({
  providerId,
  quoteId,
  quoteData,
}: {
  providerId: string;
  quoteId: string;
  quoteData: Record<string, any>;
}): SupabaseQuoteRow => {
  const nowIso = new Date().toISOString();
  const createdAt = toIso(quoteData.createdAt, nowIso);
  const updatedAt = toIso(
    quoteData.updatedAt || quoteData?.pricing?.updatedAt,
    createdAt
  );

  return {
    id: quoteId,
    provider_id: providerId,
    session_id: quoteData.sessionId || null,
    homeowner_id: quoteData.homeownerId || null,
    house_id: quoteData.houseId || null,
    signalwire_conference_id:
      quoteData.signalwireConferenceId || null,
    signalwire_recording_id:
      quoteData.signalwireRecordingId ||
      quoteData?.videoEstimate?.recordingId ||
      null,
    status: inferStatus(quoteData),
    pricing: normalizePricing(quoteData.pricing),
    customer_info: {
      name: quoteData.homeownerName || null,
      email: quoteData.homeownerEmail || null,
      phone: quoteData.homeownerPhone || null,
      address: quoteData.homeownerAddress || null,
    },
    signature:
      quoteData.quoteSignature ||
      (quoteData.quoteSignatureDataUrl
        ? {
            dataUrl: quoteData.quoteSignatureDataUrl,
            signedAt: quoteData.quoteSignatureCapturedAt || null,
          }
        : {}),
    metadata: quoteData,
    created_at: createdAt,
    updated_at: updatedAt,
  };
};

export const upsertQuoteSupabaseFromFirestore = async ({
  providerId,
  quoteId,
  quoteData,
}: {
  providerId: string;
  quoteId: string;
  quoteData: Record<string, any>;
}) => {
  const row = mapFirestoreQuoteToSupabaseRow({
    providerId,
    quoteId,
    quoteData,
  });

  const { error } = await supabaseServer.from('quotes').upsert(row, {
    onConflict: 'id',
  });
  if (error) throw error;
  return row;
};

export const getQuoteSupabase = async ({
  providerId,
  quoteId,
}: {
  providerId: string;
  quoteId: string;
}) => {
  const { data, error } = await supabaseServer
    .from('quotes')
    .select('*')
    .eq('provider_id', providerId)
    .eq('id', quoteId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const findLatestQuoteByConferenceSupabase = async ({
  conferenceId,
  providerId,
}: {
  conferenceId: string;
  providerId?: string;
}) => {
  let query = supabaseServer
    .from('quotes')
    .select('*')
    .eq('signalwire_conference_id', conferenceId)
    .order('updated_at', { ascending: false })
    .limit(1);

  if (providerId) {
    query = query.eq('provider_id', providerId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data?.[0] || null;
};

