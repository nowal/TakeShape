import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, query, where, getDocs, arrayUnion, Timestamp } from 'firebase/firestore';
import firebaseApp from '@/lib/firebase';

// Initialize Firestore
const db = getFirestore(firebaseApp);

// Collection names
const HOMEOWNERS_COLLECTION = 'homeowners';

// Homeowner interface
export interface Homeowner {
  id?: string;
  name: string;
  email: string;
  phone: string;
  sessions: string[];
  houses: string[];
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

/**
 * Get a homeowner by ID
 * @param homeownerId The homeowner ID
 * @returns The homeowner data or null if not found
 */
export const getHomeowner = async (homeownerId: string) => {
  try {
    const homeownerRef = doc(db, HOMEOWNERS_COLLECTION, homeownerId);
    const homeownerSnap = await getDoc(homeownerRef);
    
    if (homeownerSnap.exists()) {
      return {
        id: homeownerSnap.id,
        ...homeownerSnap.data()
      } as Homeowner;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting homeowner:', error);
    throw error;
  }
};

/**
 * Get a homeowner by email
 * @param email The homeowner's email
 * @returns The homeowner data or null if not found
 */
export const getHomeownerByEmail = async (email: string) => {
  try {
    const homeownersQuery = query(
      collection(db, HOMEOWNERS_COLLECTION), 
      where('email', '==', email)
    );
    
    const querySnapshot = await getDocs(homeownersQuery);
    
    if (!querySnapshot.empty) {
      const homeownerDoc = querySnapshot.docs[0];
      return {
        id: homeownerDoc.id,
        ...homeownerDoc.data()
      } as Homeowner;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting homeowner by email:', error);
    throw error;
  }
};

/**
 * Create a new homeowner
 * @param homeownerData The homeowner data
 * @returns The created homeowner data
 */
export const createHomeowner = async (homeownerData: Omit<Homeowner, 'id' | 'createdAt' | 'updatedAt' | 'sessions' | 'houses'>) => {
  try {
    // Create a new document reference with auto-generated ID
    const homeownerRef = doc(collection(db, HOMEOWNERS_COLLECTION));
    
    // Add timestamps and initialize arrays
    const dataToSave = {
      ...homeownerData,
      sessions: [],
      houses: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Save to Firestore
    await setDoc(homeownerRef, dataToSave);
    
    // Return the created homeowner with ID
    return {
      id: homeownerRef.id,
      ...dataToSave
    } as Homeowner;
  } catch (error) {
    console.error('Error creating homeowner:', error);
    throw error;
  }
};

/**
 * Add a session to a homeowner
 * @param homeownerId The homeowner ID
 * @param sessionId The session ID to add
 */
export const addSessionToHomeowner = async (homeownerId: string, sessionId: string) => {
  try {
    const homeownerRef = doc(db, HOMEOWNERS_COLLECTION, homeownerId);
    
    await updateDoc(homeownerRef, {
      sessions: arrayUnion(sessionId),
      updatedAt: new Date()
    });
    
    return true;
  } catch (error) {
    console.error('Error adding session to homeowner:', error);
    throw error;
  }
};

/**
 * Add a house to a homeowner
 * @param homeownerId The homeowner ID
 * @param houseId The house ID to add
 */
export const addHouseToHomeowner = async (homeownerId: string, houseId: string) => {
  try {
    const homeownerRef = doc(db, HOMEOWNERS_COLLECTION, homeownerId);
    
    await updateDoc(homeownerRef, {
      houses: arrayUnion(houseId),
      updatedAt: new Date()
    });
    
    return true;
  } catch (error) {
    console.error('Error adding house to homeowner:', error);
    throw error;
  }
};

/**
 * Get all homeowners
 * @returns Array of homeowners
 */
export const getAllHomeowners = async () => {
  try {
    const homeownersSnapshot = await getDocs(collection(db, HOMEOWNERS_COLLECTION));
    
    const homeowners: Homeowner[] = [];
    
    homeownersSnapshot.forEach((doc) => {
      homeowners.push({
        id: doc.id,
        ...doc.data()
      } as Homeowner);
    });
    
    return homeowners;
  } catch (error) {
    console.error('Error getting all homeowners:', error);
    throw error;
  }
};
