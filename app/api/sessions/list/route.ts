import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import firebaseApp from '@/lib/firebase';

// Initialize Firestore
const db = getFirestore(firebaseApp);

export async function GET(request: NextRequest) {
  try {
    // Get the limit parameter from the URL, default to 10
    const url = new URL(request.url);
    const limitParam = url.searchParams.get('limit');
    const limitValue = limitParam ? parseInt(limitParam, 10) : 10;
    
    // Query the sessions collection, ordered by lastActive (most recent first)
    const sessionsQuery = query(
      collection(db, 'sessions'),
      orderBy('lastActive', 'desc'),
      limit(limitValue)
    );
    
    const sessionsSnapshot = await getDocs(sessionsQuery);
    
    // Format the sessions data
    const sessions = sessionsSnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convert Firestore Timestamp to ISO string for JSON serialization
      const lastActive = data.lastActive ? 
        (data.lastActive instanceof Date ? 
          data.lastActive.toISOString() : 
          new Date(data.lastActive.seconds * 1000).toISOString()
        ) : null;
      
      const createdAt = data.createdAt ? 
        (data.createdAt instanceof Date ? 
          data.createdAt.toISOString() : 
          new Date(data.createdAt.seconds * 1000).toISOString()
        ) : null;
      
      return {
        id: doc.id,
        lastActive,
        createdAt,
        homeownerId: data.homeownerId || null,
        houseId: data.houseId || null,
        currentRoomId: data.currentRoomId || null
      };
    });
    
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error listing sessions:', error);
    return NextResponse.json(
      { error: 'Failed to list sessions' },
      { status: 500 }
    );
  }
}
