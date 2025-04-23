import { NextRequest, NextResponse } from 'next/server';
import { getSession, updateSessionActivity } from '@/utils/firestore/session';

// Route segment config
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
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
    
    // Update session activity
    await updateSessionActivity(sessionId);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Session activity updated successfully' 
    });
  } catch (error) {
    console.error('Error updating session activity:', error);
    return NextResponse.json(
      { error: 'Failed to update session activity' },
      { status: 500 }
    );
  }
}
