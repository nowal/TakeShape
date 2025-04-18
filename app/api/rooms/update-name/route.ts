import { NextRequest, NextResponse } from 'next/server';
import { updateSessionRoom, getSession, getRoom } from '@/utils/firestore/session';

// Route segment config
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    console.log('Room name update request received');
    const { sessionId, roomId, name } = await request.json();
    
    console.log(`Updating room name: sessionId=${sessionId}, roomId=${roomId}, name=${name}`);

    if (!sessionId) {
      console.error('Missing sessionId in request');
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    if (!roomId) {
      console.error('Missing roomId in request');
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
    }

    if (!name) {
      console.error('Missing name in request');
      return NextResponse.json({ error: 'Room name is required' }, { status: 400 });
    }

    // Get the current session data
    const session = await getSession(sessionId);
    if (!session) {
      console.error(`Session not found: ${sessionId}`);
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    
    // Get the current room data to verify it exists
    const currentRoom = await getRoom(sessionId, roomId);
    if (!currentRoom) {
      console.error(`Room not found: ${roomId}`);
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    
    console.log(`Current room data: ${JSON.stringify(currentRoom)}`);

    // Update only the name field in the room
    const updatedRoom = await updateSessionRoom(sessionId, roomId, {
      name: name
    });
    
    console.log(`Room name updated successfully: ${JSON.stringify(updatedRoom)}`);

    return NextResponse.json({
      success: true,
      roomId,
      name,
      room: updatedRoom
    });
  } catch (error: any) {
    console.error('Error updating room name:', error);
    return NextResponse.json(
      { error: 'Failed to update room name', details: error.message },
      { status: 500 }
    );
  }
}
