import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseDataLayerEnabled } from '@/lib/feature-flags';
import { supabaseServer } from '@/lib/supabase/server';
import firebase from '@/lib/firebase';
import {
  collection,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
} from 'firebase/firestore';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const mapSupabaseQuote = (row: Record<string, any>) => {
  const pricing = (row.pricing || {}) as Record<string, any>;
  const customerInfo = (row.customer_info || {}) as Record<
    string,
    any
  >;
  const metadata = (row.metadata || {}) as Record<string, any>;
  const videoEstimate = (metadata.videoEstimate || {}) as Record<
    string,
    any
  >;

  return {
    id: String(row.id || ''),
    data: {
      pricing,
      homeownerName:
        customerInfo.name || metadata.homeownerName || null,
      homeownerEmail:
        customerInfo.email || metadata.homeownerEmail || null,
      homeownerPhone:
        customerInfo.phone || metadata.homeownerPhone || null,
      homeownerAddress:
        customerInfo.address || metadata.homeownerAddress || null,
      quoteSignature:
        row.signature || metadata.quoteSignature || null,
      quoteSignatureDataUrl:
        metadata.quoteSignatureDataUrl || null,
      quoteSignatureCaptured:
        metadata.quoteSignatureCaptured || false,
      quoteSignatureCapturedAt:
        metadata.quoteSignatureCapturedAt || null,
      signalwireRecordingId:
        row.signalwire_recording_id ||
        videoEstimate.recordingId ||
        null,
      signalwireConferenceId:
        row.signalwire_conference_id || null,
      videoEstimate: {
        ...(videoEstimate || {}),
        url:
          videoEstimate.url ||
          metadata?.videoEstimate?.url ||
          null,
      },
      videoEstimates: metadata.videoEstimates || [],
      createdAt: row.created_at || null,
      updatedAt: row.updated_at || null,
    },
  };
};

export async function GET(request: NextRequest) {
  try {
    const search = new URL(request.url).searchParams;
    const providerId = String(
      search.get('providerId') ||
        search.get('painterId') ||
        ''
    ).trim();

    if (!providerId) {
      return NextResponse.json(
        { error: 'providerId is required' },
        { status: 400 }
      );
    }

    if (isSupabaseDataLayerEnabled()) {
      const { data, error } = await supabaseServer
        .from('quotes')
        .select('*')
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;
      return NextResponse.json({
        quotes: (data || []).map((row) =>
          mapSupabaseQuote(row as Record<string, any>)
        ),
        source: 'supabase',
      });
    }

    const firestore = getFirestore(firebase);
    const quotesQuery = query(
      collection(firestore, 'painters', providerId, 'quotes'),
      orderBy('createdAt', 'desc'),
      limit(30)
    );
    const snapshot = await getDocs(quotesQuery);

    return NextResponse.json({
      quotes: snapshot.docs.map((doc) => ({
        id: doc.id,
        data: doc.data(),
      })),
      source: 'firestore',
    });
  } catch (error) {
    console.error('Quote list API error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
