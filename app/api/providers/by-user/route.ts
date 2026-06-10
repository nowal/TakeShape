import { NextRequest, NextResponse } from 'next/server';
import { getTakeShapeAppSupabaseAdmin } from '@/lib/supabase/takeshape-app-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const providerSelect = [
  'id',
  'auth_user_id',
  'business_name',
  'email',
  'phone',
  'zip',
  'city',
  'state',
  'lat',
  'lng',
  'logo_url',
  'address_normalized',
  'service_radius_miles',
  'service_types',
  'is_active',
].join(',');

type ProviderRecord = Record<string, unknown>;

const toText = (value: unknown) =>
  typeof value === 'string' ? value : '';

const toClientProvider = (provider: ProviderRecord | null) => {
  if (!provider) return null;

  return {
    ...provider,
    address: toText(provider.address_normalized),
    phone_number: toText(provider.phone),
    range_km:
      typeof provider.service_radius_miles === 'number'
        ? provider.service_radius_miles
        : null,
    user_id: toText(provider.auth_user_id) || null,
  };
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = String(searchParams.get('userId') || '').trim();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const supabase = getTakeShapeAppSupabaseAdmin();
    const { data: providerByAuthUserId, error: providerError } =
      await supabase
        .from('providers')
        .select(providerSelect)
        .eq('auth_user_id', userId)
        .maybeSingle();

    if (providerError) throw providerError;

    let provider = providerByAuthUserId as ProviderRecord | null;

    if (!provider) {
      const { data: profile, error: profileError } = await supabase
        .from('provider_profiles')
        .select('provider_id')
        .eq('auth_user_id', userId)
        .maybeSingle();

      if (profileError) throw profileError;

      const providerId = String(
        (profile as { provider_id?: string } | null)?.provider_id || ''
      );
      if (providerId) {
        const { data: providerByProfile, error: linkedProviderError } =
          await supabase
            .from('providers')
            .select(providerSelect)
            .eq('id', providerId)
            .maybeSingle();

        if (linkedProviderError) throw linkedProviderError;
        provider = providerByProfile as ProviderRecord | null;
      }
    }

    return NextResponse.json(
      {
        provider: toClientProvider(provider),
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
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
