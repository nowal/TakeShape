import { NextRequest, NextResponse } from 'next/server';
import { getSession, saveRoom } from '@/utils/firestore/session';

// Route segment config
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    console.log('Room creation request received');
    
    // Get the request body
    const body = await request.json();
    
    // Extract required fields
    const { sessionId, roomId, name, ...otherFields } = body;
    
    console.log(`Creating room: sessionId=${sessionId}, roomId=${roomId}, name=${name}, otherFields=`, otherFields);
    
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
    
    console.log(`Creating room in Firestore: ${roomId} -> "${name}" with additional fields`);
    
    // Create room in Firestore
    try {
      // Prepare room data
      const roomData = {
        name,
        ...otherFields,
        created_at: otherFields.created_at || new Date(),
        updated_at: new Date()
      };
      
      console.log('Creating room with data:', roomData);
      
      // Use saveRoom to create the room
      const createdRoom = await saveRoom(sessionId, roomId, roomData);
      
      console.log('Room created successfully:', createdRoom);
      
      // Return success response with the created room data
      return NextResponse.json({
        success: true,
        room: createdRoom,
        message: 'Room created successfully'
      });
    } catch (error) {
      console.error('Error creating room in Firestore:', error);
      
      // Return detailed error
      return NextResponse.json(
        { 
          error: 'Failed to create room',
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
