import { NextResponse } from 'next/server';
import {
  DEFAULT_INTAKE_EMBED_SETTINGS,
  normalizeIntakeEmbedSettings,
} from '@/app/embed/intake/settings';
import {
  getPainter,
  setPainterIntakeEmbedSettings,
} from '@/utils/firestore/painter';

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

    const painter = await getPainter(providerId);
    const settings = normalizeIntakeEmbedSettings(
      (painter as any)?.intakeEmbedSettings || {}
    );

    return NextResponse.json({
      providerId,
      settings,
      source: 'firestore',
    });
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

    await setPainterIntakeEmbedSettings(
      providerId,
      settings as unknown as Record<string, unknown>
    );

    return NextResponse.json({
      providerId,
      settings,
      source: 'firestore',
    });
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
