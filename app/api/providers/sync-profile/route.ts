import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseDataLayerEnabled } from '@/lib/feature-flags';
import { supabaseServer } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseDataLayerEnabled()) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: 'USE_SUPABASE_DATA_LAYER is disabled',
      });
    }

    const body = await request.json();
    const providerId = String(body.providerId || '').trim();
    const userId = String(body.userId || '').trim();

    if (!providerId || !userId) {
      return NextResponse.json(
        { ok: false, error: 'providerId and userId are required' },
        { status: 400 }
      );
    }

    const payload = {
      id: providerId,
      user_id: userId,
      business_name: String(body.businessName || '').trim(),
      address: String(body.address || '').trim(),
      is_insured: Boolean(body.isInsured),
      logo_url: String(body.logoUrl || '').trim(),
      terms_and_conditions_url: String(
        body.termsAndConditionsUrl || ''
      ).trim(),
      phone_number: String(body.phoneNumber || '').trim(),
    };

    const { error } = await supabaseServer
      .from('providers')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      ok: true,
      providerId,
    });
  } catch (error) {
    console.error('Provider profile sync API error:', error);
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

