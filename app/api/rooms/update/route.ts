import { NextRequest, NextResponse } from 'next/server';
import { getSession, updateRoomName } from '@/utils/firestore/session';

// Route segment config
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    
    // Extract required fields
    const { sessionId, roomId, name } = body;
    
    // Validate required fields
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      );
    }
    
    if (!name) {
      return NextResponse.json(
        { error: 'Room name is required' },
        { status: 400 }
      );
    }
    
    // Check if session exists
    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    console.log(`Updating room name in Firestore: ${roomId} -> "${name}"`);
    
    // Update room name in Firestore
    try {
      const updatedRoom = await updateRoomName(sessionId, roomId, name);
      
      console.log('Room name updated successfully:', updatedRoom);
      
      // Return success response
      return NextResponse.json({
        success: true,
        room: updatedRoom
      });
    } catch (error) {
      console.error('Error updating room name in Firestore:', error);
      
      // Check if it's a "Room not found" error
      if (error instanceof Error && error.message === 'Room not found') {
        return NextResponse.json(
          { error: 'Room not found' },
          { status: 404 }
        );
      }
      
      // Return generic error
      return NextResponse.json(
        { error: 'Failed to update room name' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
