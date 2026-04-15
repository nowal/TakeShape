import { NextResponse } from 'next/server';
import {
  DEFAULT_INTAKE_EMBED_SETTINGS,
  normalizeIntakeEmbedSettings,
} from '@/app/embed/intake/settings';
import {
  getProviderIntakeEmbedSettingsSupabase,
  upsertProviderIntakeEmbedSettingsSupabase,
} from '@/lib/data/supabase/provider-embed-settings';
import {
  getPainter,
  setPainterIntakeEmbedSettings,
} from '@/utils/firestore/painter';

export const runtime = 'nodejs';

const isSupabaseFallbackError = (error: unknown) => {
  const code = String((error as any)?.code || '')
    .trim()
    .toUpperCase();
  const message = String((error as any)?.message || '')
    .trim()
    .toLowerCase();
  return (
    message.includes('invalid api key') ||
    code === 'PGRST205' ||
    message.includes('could not find the table')
  );
};

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

    let settings = DEFAULT_INTAKE_EMBED_SETTINGS;
    let source: 'supabase' | 'firestore-fallback' = 'supabase';

    try {
      settings =
        await getProviderIntakeEmbedSettingsSupabase(providerId);
    } catch (error) {
      if (!isSupabaseFallbackError(error)) {
        throw error;
      }

      const painter = await getPainter(providerId);
      settings = normalizeIntakeEmbedSettings(
        (painter as any)?.intakeEmbedSettings || {}
      );
      source = 'firestore-fallback';
    }

    return NextResponse.json({ providerId, settings, source });
  } catch (error) {
    console.error(
      '[api/embed/intake-settings] GET failed:',
      error
    );
    return NextResponse.json(
      { error: 'Failed to load intake settings' },
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

    let source: 'supabase' | 'firestore-fallback' = 'supabase';
    try {
      await upsertProviderIntakeEmbedSettingsSupabase({
        providerId,
        intakeSettings: settings,
      });
    } catch (error) {
      if (!isSupabaseFallbackError(error)) {
        throw error;
      }

      await setPainterIntakeEmbedSettings(
        providerId,
        settings as unknown as Record<string, unknown>
      );
      source = 'firestore-fallback';
    }

    return NextResponse.json({ providerId, settings, source });
  } catch (error) {
    console.error(
      '[api/embed/intake-settings] POST failed:',
      error
    );
    return NextResponse.json(
      { error: 'Failed to save intake settings' },
      { status: 500 }
    );
  }
}
