import { NextRequest, NextResponse } from 'next/server';
import { getPainter, addSessionToPainter } from '@/utils/firestore/painter';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { painterId, sessionId } = await request.json();
    
    if (!painterId || !sessionId) {
      return NextResponse.json(
        { error: 'Painter ID and Session ID are required' },
        { status: 400 }
      );
    }

    // Check if painter exists in Firestore first.
    const painter = await getPainter(painterId);
    if (!painter) {
      return NextResponse.json(
        { error: 'Painter not found' },
        { status: 404 }
      );
    }

    // Write to Firestore.
    await addSessionToPainter(painterId, sessionId);

    // Write to Supabase.
    const existingSessions = Array.isArray(painter.sessions)
      ? painter.sessions
      : [];
    const normalizedSessions = existingSessions
      .map((value) => String(value || '').trim())
      .filter(Boolean);
    const nextSessions = normalizedSessions.includes(sessionId)
      ? normalizedSessions
      : [...normalizedSessions, sessionId];

    const { error: upsertError } = await supabaseServer
      .from('providers')
      .upsert(
        {
          id: painterId,
          user_id: painter.userId || null,
          sessions: nextSessions,
        },
        { onConflict: 'id' }
      );

    if (upsertError) throw upsertError;
    
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
