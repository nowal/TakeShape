import { NextRequest, NextResponse } from 'next/server';
import firebase from '@/lib/firebase';
import {
  collectionGroup,
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
    if (!conferenceId) {
      return NextResponse.json(
        { error: 'conferenceId is required' },
        { status: 400 }
      );
    }

    const firestore = getFirestore(firebase);
    const quotesQuery = query(
      collectionGroup(firestore, 'quotes'),
      where('signalwireConferenceId', '==', conferenceId)
    );
    const snapshot = await getDocs(quotesQuery);
    if (snapshot.empty) {
      return NextResponse.json({ found: false });
    }

    const sorted = snapshot.docs.sort((a, b) => {
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
      found: true,
      quoteId: selected.id,
      pricing: {
        rows,
        totalPrice: Number(pricing.totalPrice) || 0,
        updatedAt: pricing.updatedAt || data.updatedAt || data.createdAt || null
      },
      updatedAt: data.updatedAt || data.createdAt || null
    });
  } catch (error) {
    console.error('Quote by conference API error:', error);
    return NextResponse.json(
      { error: 'Failed to load quote for conference' },
      { status: 500 }
    );
  }
}
