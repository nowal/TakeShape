import { NextRequest, NextResponse } from 'next/server';
import { getPainter, addSessionToPainter } from '@/utils/firestore/painter';

export async function POST(request: NextRequest) {
  try {
    const { painterId, sessionId } = await request.json();
    
    if (!painterId || !sessionId) {
      return NextResponse.json(
        { error: 'Painter ID and Session ID are required' },
        { status: 400 }
      );
    }
    
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
    
    return NextResponse.json(
      { success: true, message: 'Session added to painter successfully' },
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
