import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import firebase from '@/lib/firebase';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { upsertQuoteSupabaseFromFirestore } from '@/lib/data/supabase/quotes';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const providerId = String(
      body.providerId || body.painterDocId || body.painterId || ''
    ).trim();
    const quoteId = String(body.quoteId || '').trim();

    if (!providerId || !quoteId) {
      return NextResponse.json(
        { error: 'providerId and quoteId are required' },
        { status: 400 }
      );
    }

    let quoteData: Record<string, any> | null = null;

    try {
      const adminRef = getAdminFirestore()
        .collection('painters')
        .doc(providerId)
        .collection('quotes')
        .doc(quoteId);
      const snap = await adminRef.get();
      if (snap.exists) {
        quoteData = snap.data() as Record<string, any>;
      }
    } catch {
      // fallback below
    }

    if (!quoteData) {
      const clientRef = doc(
        getFirestore(firebase),
        'painters',
        providerId,
        'quotes',
        quoteId
      );
      const snap = await getDoc(clientRef);
      if (!snap.exists()) {
        return NextResponse.json(
          { error: 'Quote not found in Firestore' },
          { status: 404 }
        );
      }
      quoteData = snap.data() as Record<string, any>;
    }

    const upserted = await upsertQuoteSupabaseFromFirestore({
      providerId,
      quoteId,
      quoteData,
    });

    return NextResponse.json({
      ok: true,
      quoteId: upserted.id,
      providerId: upserted.provider_id,
      updatedAt: upserted.updated_at,
    });
  } catch (error) {
    console.error('Quote sync API error:', error);
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

