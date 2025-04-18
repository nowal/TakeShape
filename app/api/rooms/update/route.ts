import { NextRequest, NextResponse } from 'next/server';
import { getSession, updateSessionRoom, getRoom } from '@/utils/firestore/session';

// Route segment config
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    console.log('Room update request received');
    
    // Get the request body
    const body = await request.json();
    
    // Extract required fields
    const { sessionId, roomId, name, ...otherFields } = body;
    
    console.log(`Updating room: sessionId=${sessionId}, roomId=${roomId}, name=${name}, otherFields=`, otherFields);
    
    // Validate required fields
    if (!sessionId) {
      console.error('Missing sessionId in request');
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    if (!roomId) {
      console.error('Missing roomId in request');
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      );
    }
    
    if (!name) {
      console.error('Missing name in request');
      return NextResponse.json(
        { error: 'Room name is required' },
        { status: 400 }
      );
    }
    
    // Check if session exists
    const session = await getSession(sessionId);
    if (!session) {
      console.error(`Session not found: ${sessionId}`);
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    // Get the current room data to verify it exists
    const currentRoom = await getRoom(sessionId, roomId);
    if (!currentRoom) {
      console.error(`Room not found: ${roomId}`);
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }
    
    console.log(`Current room data: ${JSON.stringify(currentRoom)}`);
    console.log(`Updating room in Firestore: ${roomId} -> "${name}" and additional fields`);
    
    // Update room in Firestore
    try {
      // Include other fields in the update
      const updateData = {
        name,
        ...otherFields,
        updatedAt: new Date() // Always update the timestamp
      };
      
      console.log('Updating room with data:', updateData);
      
      // Use updateSessionRoom to update all fields
      const updatedRoom = await updateSessionRoom(sessionId, roomId, updateData);
      
      console.log('Room updated successfully:', updatedRoom);
      
      // Return success response with the updated room data
      return NextResponse.json({
        success: true,
        room: updatedRoom,
        message: 'Room updated successfully'
      });
    } catch (error) {
      console.error('Error updating room in Firestore:', error);
      
      // Check if it's a "Room not found" error
      if (error instanceof Error && error.message === 'Room not found') {
        return NextResponse.json(
          { error: 'Room not found' },
          { status: 404 }
        );
      }
      
      // Check if it's a "Session ID mismatch" error
      if (error instanceof Error && error.message === 'Session ID mismatch') {
        return NextResponse.json(
          { error: 'Session ID mismatch' },
          { status: 403 }
        );
      }
      
      // Return detailed error
      return NextResponse.json(
        { 
          error: 'Failed to update room',
          details: error instanceof Error ? error.message : 'Unknown error',
          roomId,
          sessionId
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
