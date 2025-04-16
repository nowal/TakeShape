import { NextRequest, NextResponse } from 'next/server';
import { updateSessionRoom, getSession } from '@/utils/firestore/session';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, roomId, name } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: 'Room name is required' }, { status: 400 });
    }

    // Get the current session data
    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Update only the name field in the room
    await updateSessionRoom(sessionId, roomId, {
      name: name
    });

    return NextResponse.json({
      success: true,
      roomId,
      name
    });
  } catch (error: any) {
    console.error('Error updating room name:', error);
    return NextResponse.json(
      { error: 'Failed to update room name', details: error.message },
      { status: 500 }
    );
  }
}
