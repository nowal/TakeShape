import { NextResponse } from 'next/server';
import {
  DEFAULT_INTAKE_EMBED_SETTINGS,
  normalizeIntakeEmbedSettings,
} from '@/app/embed/intake/settings';
import {
  getProviderIntakeEmbedSettingsSupabase,
  upsertProviderIntakeEmbedSettingsSupabase,
} from '@/lib/data/supabase/provider-embed-settings';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = String(
      searchParams.get('providerId') || ''
    ).trim();

    if (!providerId) {
      return NextResponse.json(
        {
          providerId: '',
          settings: DEFAULT_INTAKE_EMBED_SETTINGS,
        },
        { status: 200 }
      );
    }

    const settings =
      await getProviderIntakeEmbedSettingsSupabase(providerId);

    return NextResponse.json({
      providerId,
      settings,
      source: 'supabase',
    });
  } catch (error) {
    console.error(
      '[api/embed/intake-settings] GET failed:',
      error
    );
    const code =
      error && typeof error === 'object' && 'code' in error
        ? String((error as { code?: unknown }).code || '')
        : '';
    const likelyCause =
      code === 'PGRST205'
        ? 'Missing Supabase migration for public.provider_embed_settings'
        : undefined;
    return NextResponse.json(
      {
        error: 'Failed to load intake settings',
        code: code || undefined,
        likelyCause,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const providerId = String(body?.providerId || '').trim();
    const settings = normalizeIntakeEmbedSettings(
      body?.settings || {}
    );

    if (!providerId) {
      return NextResponse.json(
        { error: 'providerId is required' },
        { status: 400 }
      );
    }

    await upsertProviderIntakeEmbedSettingsSupabase({
      providerId,
      intakeSettings: settings,
    });

    return NextResponse.json({
      providerId,
      settings,
      source: 'supabase',
    });
  } catch (error) {
    console.error(
      '[api/embed/intake-settings] POST failed:',
      error
    );
    const code =
      error && typeof error === 'object' && 'code' in error
        ? String((error as { code?: unknown }).code || '')
        : '';
    const likelyCause =
      code === 'PGRST205'
        ? 'Missing Supabase migration for public.provider_embed_settings'
        : undefined;
    return NextResponse.json(
      {
        error: 'Failed to save intake settings',
        code: code || undefined,
        likelyCause,
      },
      { status: 500 }
    );
  }
}
