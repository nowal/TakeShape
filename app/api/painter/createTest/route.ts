import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, doc, setDoc, collection } from 'firebase/firestore';
import firebaseApp from '@/lib/firebase';

// Initialize Firestore
const db = getFirestore(firebaseApp);

export async function POST(request: NextRequest) {
  try {
    // Create a new document reference with the specified ID
    const painterId = 'DEMO_PAINTER_ID';
    const painterRef = doc(db, 'painters', painterId);
    
    // Create test painter data
    const painterData = {
      businessName: 'Test Painting Company',
      address: '123 Main St, Anytown, USA',
      isInsured: true,
      logoUrl: '',
      phoneNumber: '555-123-4567',
      userId: 'test-user-id',
      sessions: [], // Initialize empty sessions array
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Save to Firestore
    await setDoc(painterRef, painterData);
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Test painter created successfully',
        painterId
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error creating test painter:', error);
    return NextResponse.json(
      { error: 'Failed to create test painter' },
      { status: 500 }
    );
  }
}
