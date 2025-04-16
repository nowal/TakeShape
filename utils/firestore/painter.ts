import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, query, where, getDocs, arrayUnion, Timestamp } from 'firebase/firestore';
import firebaseApp from '@/lib/firebase';

// Initialize Firestore
const db = getFirestore(firebaseApp);

// Collection names
const PAINTERS_COLLECTION = 'painters';

// Painter interface
export interface Painter {
  id?: string;
  businessName: string;
  address: string;
  coords?: { lat: number; lng: number };
  range?: number;
  isInsured: boolean;
  logoUrl: string;
  phoneNumber: string;
  userId: string;
  sessions: string[];
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

/**
 * Get a painter by ID
 * @param painterId The painter ID
 * @returns The painter data or null if not found
 */
export const getPainter = async (painterId: string) => {
  try {
    const painterRef = doc(db, PAINTERS_COLLECTION, painterId);
    const painterSnap = await getDoc(painterRef);
    
    if (painterSnap.exists()) {
      return {
        id: painterSnap.id,
        ...painterSnap.data()
      } as Painter;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting painter:', error);
    throw error;
  }
};

/**
 * Get a painter by user ID
 * @param userId The user ID
 * @returns The painter data or null if not found
 */
export const getPainterByUserId = async (userId: string) => {
  try {
    const paintersQuery = query(
      collection(db, PAINTERS_COLLECTION), 
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(paintersQuery);
    
    if (!querySnapshot.empty) {
      const painterDoc = querySnapshot.docs[0];
      return {
        id: painterDoc.id,
        ...painterDoc.data()
      } as Painter;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting painter by user ID:', error);
    throw error;
  }
};

/**
 * Add a session to a painter
 * @param painterId The painter ID
 * @param sessionId The session ID to add
 */
export const addSessionToPainter = async (painterId: string, sessionId: string) => {
  try {
    const painterRef = doc(db, PAINTERS_COLLECTION, painterId);
    
    await updateDoc(painterRef, {
      sessions: arrayUnion(sessionId),
      updatedAt: new Date()
    });
    
    return true;
  } catch (error) {
    console.error('Error adding session to painter:', error);
    throw error;
  }
};

/**
 * Get all painters
 * @returns Array of painters
 */
export const getAllPainters = async () => {
  try {
    const paintersSnapshot = await getDocs(collection(db, PAINTERS_COLLECTION));
    
    const painters: Painter[] = [];
    
    paintersSnapshot.forEach((doc) => {
      painters.push({
        id: doc.id,
        ...doc.data()
      } as Painter);
    });
    
    return painters;
  } catch (error) {
    console.error('Error getting all painters:', error);
    throw error;
  }
};
