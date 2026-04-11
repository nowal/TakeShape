import { NextRequest, NextResponse } from 'next/server';
import { getPainter, addSessionToPainter } from '@/utils/firestore/painter';
import { isSupabaseDataLayerEnabled } from '@/lib/feature-flags';
import {
  addSessionToProviderSupabase,
  getProviderByIdSupabase,
} from '@/lib/data/supabase/providers';
import { sessionExistsSupabase } from '@/lib/data/supabase/sessions';

export async function POST(request: NextRequest) {
  try {
    const { painterId, sessionId } = await request.json();
    
    if (!painterId || !sessionId) {
      return NextResponse.json(
        { error: 'Painter ID and Session ID are required' },
        { status: 400 }
      );
    }

    if (isSupabaseDataLayerEnabled()) {
      const provider = await getProviderByIdSupabase(painterId);
      if (!provider) {
        return NextResponse.json(
          { error: 'Provider not found' },
          { status: 404 }
        );
      }

      const sessionExists = await sessionExistsSupabase(sessionId);
      if (!sessionExists) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }

      await addSessionToProviderSupabase({
        providerId: painterId,
        sessionId,
      });
    } else {
      // Check if painter exists
      const painter = await getPainter(painterId);
      if (!painter) {
        return NextResponse.json(
          { error: 'Painter not found' },
          { status: 404 }
        );
      }

      // Add session to painter
      await addSessionToPainter(painterId, sessionId);
    }
    
    return NextResponse.json(
      { success: true, message: 'Session added to provider successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error adding session to painter:', error);
    return NextResponse.json(
      { error: 'Failed to add session to painter' },
      { status: 500 }
    );
  }
}
