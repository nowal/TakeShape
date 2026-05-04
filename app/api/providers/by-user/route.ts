import { NextRequest, NextResponse } from 'next/server';
import { getProviderByUserIdSupabase } from '@/lib/data/supabase/providers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

    const provider = await getProviderByUserIdSupabase(userId);
    return NextResponse.json({
      provider: provider || null,
    });
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
