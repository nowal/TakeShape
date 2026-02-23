import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import firebase from '@/lib/firebase';
import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  where
} from 'firebase/firestore';

export const dynamic = 'force-dynamic';

type QuoteRow = {
  item: string;
  description: string;
  price: number;
};

const toMillis = (value: any): number => {
  const seconds = Number(value?.seconds);
  if (Number.isFinite(seconds) && seconds > 0) return seconds * 1000;
  const parsed = new Date(String(value || '')).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conferenceId = String(searchParams.get('conferenceId') || '').trim();
    const painterDocId = String(
      searchParams.get('painterDocId') ||
      searchParams.get('painterId') ||
      ''
    ).trim();
    const quoteId = String(searchParams.get('quoteId') || '').trim();

    if (!conferenceId && (!painterDocId || !quoteId)) {
      return NextResponse.json(
        { error: 'conferenceId or painterDocId+quoteId is required' },
        { status: 400 }
      );
    }

    const mapQuotePayload = (quoteIdValue: string, data: Record<string, any>) => {
      const pricing = data?.pricing || {};
      const rowsRaw = Array.isArray(pricing.rows) ? pricing.rows : [];
      const rows: QuoteRow[] = rowsRaw.map((row: any) => ({
        item: String(row?.item || ''),
        description: String(row?.description || ''),
        price: Number(row?.price) || 0
      }));

      return {
        found: true,
        quoteId: quoteIdValue,
        pricing: {
          rows,
          totalPrice: Number(pricing.totalPrice) || 0,
          updatedAt: pricing.updatedAt || data.updatedAt || data.createdAt || null
        },
        updatedAt: data.updatedAt || data.createdAt || null
      };
    };

    let adminReadError: unknown = null;

    try {
      const firestore = getAdminFirestore();

      if (painterDocId && quoteId) {
        const quoteRef = firestore
          .collection('painters')
          .doc(painterDocId)
          .collection('quotes')
          .doc(quoteId);
        const quoteSnap = await quoteRef.get();
        if (!quoteSnap.exists) {
          return NextResponse.json({ found: false });
        }

        return NextResponse.json(
          mapQuotePayload(quoteSnap.id, quoteSnap.data() as Record<string, any>)
        );
      }

      let docs: any[] = [];
      if (painterDocId && conferenceId) {
        const snapshot = await firestore
          .collection('painters')
          .doc(painterDocId)
          .collection('quotes')
          .where('signalwireConferenceId', '==', conferenceId)
          .get();
        docs = snapshot.docs;
      } else {
        const snapshot = await firestore
          .collectionGroup('quotes')
          .where('signalwireConferenceId', '==', conferenceId)
          .get();
        docs = snapshot.docs;
      }

      if (!docs.length) {
        return NextResponse.json({ found: false });
      }

      const sorted = docs.sort((a, b) => {
        const aData = a.data() as Record<string, any>;
        const bData = b.data() as Record<string, any>;
        return toMillis(bData.updatedAt || bData.createdAt) - toMillis(aData.updatedAt || aData.createdAt);
      });
      const selected = sorted[0];
      return NextResponse.json(
        mapQuotePayload(selected.id, selected.data() as Record<string, any>)
      );
    } catch (error) {
      adminReadError = error;
    }

    // Fallback to Firebase client SDK if admin credentials are unavailable.
    const firestore = getFirestore(firebase);

    if (painterDocId && quoteId) {
      const quoteRef = doc(firestore, 'painters', painterDocId, 'quotes', quoteId);
      const quoteSnap = await getDoc(quoteRef);
      if (!quoteSnap.exists()) {
        return NextResponse.json({ found: false });
      }

      return NextResponse.json(
        mapQuotePayload(quoteSnap.id, quoteSnap.data() as Record<string, any>)
      );
    }

    let docs: any[] = [];
    if (painterDocId && conferenceId) {
      const snapshot = await getDocs(
        query(
          collection(firestore, 'painters', painterDocId, 'quotes'),
          where('signalwireConferenceId', '==', conferenceId)
        )
      );
      docs = snapshot.docs;
    } else {
      const snapshot = await getDocs(
        query(
          collectionGroup(firestore, 'quotes'),
          where('signalwireConferenceId', '==', conferenceId)
        )
      );
      docs = snapshot.docs;
    }

    if (!docs.length) {
      return NextResponse.json({ found: false });
    }

    const sorted = docs.sort((a, b) => {
      const aData = a.data() as Record<string, any>;
      const bData = b.data() as Record<string, any>;
      return toMillis(bData.updatedAt || bData.createdAt) - toMillis(aData.updatedAt || aData.createdAt);
    });

    const selected = sorted[0];
    const data = selected.data() as Record<string, any>;
    const pricing = data.pricing || {};
    const rowsRaw = Array.isArray(pricing.rows) ? pricing.rows : [];
    const rows: QuoteRow[] = rowsRaw.map((row: any) => ({
      item: String(row?.item || ''),
      description: String(row?.description || ''),
      price: Number(row?.price) || 0
    }));

    return NextResponse.json({
      ...mapQuotePayload(selected.id, data),
      source: 'client-fallback',
      adminReadError: (adminReadError as Error)?.message || null
    });
  } catch (error) {
    console.error('Quote by conference API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to load quote for conference',
        details: (error as Error)?.message || 'unknown error'
      },
      { status: 500 }
    );
  }
}
