import { getFirestore, Timestamp, collection, doc, getDoc, setDoc, updateDoc, getDocs, query, where } from 'firebase/firestore';
import firebaseApp from '@/lib/firebase';

// Initialize Firestore
const db = getFirestore(firebaseApp);

// Define types
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date | Timestamp;
}

export interface Session {
  id: string;
  createdAt: Date | Timestamp;
  lastActive: Date | Timestamp;
  chatHistory: ChatMessage[];
  homeownerId?: string;
  houseId?: string;
  currentRoomId?: string;
}

// This is what getSession returns
export interface SessionData {
  id: string;
  createdAt: Date | Timestamp;
  lastActive: Date | Timestamp;
  chatHistory: ChatMessage[];
  homeownerId?: string;
  houseId?: string;
  currentRoomId?: string;
  [key: string]: any; // Allow for additional properties
}

// Collection name for sessions
const SESSIONS_COLLECTION = 'sessions';
const ROOMS_COLLECTION = 'rooms';

/**
 * Get a session by ID
 * @param sessionId The session ID
 * @returns The session data or null if not found
 */
export const getSession = async (sessionId: string): Promise<SessionData | null> => {
  try {
    const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
    const sessionSnap = await getDoc(sessionRef);
    
    if (sessionSnap.exists()) {
      return {
        id: sessionSnap.id,
        ...sessionSnap.data()
      } as SessionData;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting session:', error);
    throw error;
  }
};

/**
 * Create a new session
 * @param sessionId The session ID
 * @returns The created session data
 */
export const createSession = async (sessionId: string): Promise<SessionData> => {
  try {
    const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
    
    // Create session with timestamp
    const sessionData = {
      createdAt: new Date(),
      lastActive: new Date(),
      chatHistory: []
    };
    
    await setDoc(sessionRef, sessionData);
    
    return {
      id: sessionId,
      ...sessionData
    } as SessionData;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

/**
 * Update a session's last active timestamp
 * @param sessionId The session ID
 */
export const updateSessionActivity = async (sessionId: string) => {
  try {
    const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
    
    await updateDoc(sessionRef, {
      lastActive: new Date()
    });
  } catch (error) {
    console.error('Error updating session activity:', error);
    throw error;
  }
};

/**
 * Add a chat message to a session
 * @param sessionId The session ID
 * @param message The chat message to add
 * @param role The role of the message sender (user or assistant)
 */
export const addChatMessage = async (sessionId: string, message: string, role: 'user' | 'assistant') => {
  try {
    const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
    const sessionSnap = await getDoc(sessionRef);
    
    if (!sessionSnap.exists()) {
      throw new Error('Session not found');
    }
    
    const sessionData = sessionSnap.data();
    const chatHistory = sessionData.chatHistory || [];
    
    // Add new message
    chatHistory.push({
      role,
      content: message,
      timestamp: new Date()
    });
    
    // Update session
    await updateDoc(sessionRef, {
      chatHistory,
      lastActive: new Date()
    });
    
    return chatHistory;
  } catch (error) {
    console.error('Error adding chat message:', error);
    throw error;
  }
};

/**
 * Get chat history for a session
 * @param sessionId The session ID
 * @returns The chat history array
 */
export const getChatHistory = async (sessionId: string) => {
  try {
    const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
    const sessionSnap = await getDoc(sessionRef);
    
    if (!sessionSnap.exists()) {
      return [];
    }
    
    const sessionData = sessionSnap.data();
    return sessionData.chatHistory || [];
  } catch (error) {
    console.error('Error getting chat history:', error);
    throw error;
  }
};

/**
 * Get all rooms for a session
 * @param sessionId The session ID
 * @returns Object containing rooms by ID
 */
export const getSessionRooms = async (sessionId: string) => {
  try {
    // Query rooms collection for rooms with this session ID
    const roomsQuery = query(collection(db, ROOMS_COLLECTION), where('sessionId', '==', sessionId));
    const roomsSnap = await getDocs(roomsQuery);
    
    const rooms: Record<string, any> = {};
    
    roomsSnap.forEach((roomDoc) => {
      rooms[roomDoc.id] = {
        id: roomDoc.id,
        ...roomDoc.data()
      };
    });
    
    return rooms;
  } catch (error) {
    console.error('Error getting session rooms:', error);
    throw error;
  }
};

/**
 * Save a room to Firestore
 * @param sessionId The session ID
 * @param roomId The room ID
 * @param roomData The room data
 */
export const saveRoom = async (sessionId: string, roomId: string, roomData: any) => {
  try {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    
    // Add session ID to room data
    const dataToSave = {
      ...roomData,
      sessionId,
      updatedAt: new Date()
    };
    
    await setDoc(roomRef, dataToSave);
    
    return {
      id: roomId,
      ...dataToSave
    };
  } catch (error) {
    console.error('Error saving room:', error);
    throw error;
  }
};

/**
 * Update a room's name
 * @param sessionId The session ID
 * @param roomId The room ID
 * @param name The new room name
 */
export const updateRoomName = async (sessionId: string, roomId: string, name: string) => {
  try {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) {
      throw new Error('Room not found');
    }
    
    const roomData = roomSnap.data();
    
    // Verify session ID matches
    if (roomData.sessionId !== sessionId) {
      throw new Error('Session ID mismatch');
    }
    
    // Update room name
    await updateDoc(roomRef, {
      name,
      updatedAt: new Date()
    });
    
    return {
      id: roomId,
      ...roomData,
      name
    };
  } catch (error) {
    console.error('Error updating room name:', error);
    throw error;
  }
};

/**
 * Update a room in a session
 * @param sessionId The session ID
 * @param roomId The room ID
 * @param roomData The room data to update
 */
export const updateSessionRoom = async (sessionId: string, roomId: string, roomData: any) => {
  try {
    // First check if the room exists
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (roomSnap.exists()) {
      // Update existing room
      const existingData = roomSnap.data();
      
      // Verify session ID matches
      if (existingData.sessionId !== sessionId) {
        throw new Error('Session ID mismatch');
      }
      
      // Update room with new data
      await updateDoc(roomRef, {
        ...roomData,
        updatedAt: new Date()
      });
      
      return {
        id: roomId,
        ...existingData,
        ...roomData
      };
    } else {
      // Create new room
      return saveRoom(sessionId, roomId, roomData);
    }
  } catch (error) {
    console.error('Error updating session room:', error);
    throw error;
  }
};

/**
 * Save a 3D model path for a room
 * @param sessionId The session ID
 * @param roomId The room ID
 * @param modelPath The path to the 3D model
 */
export const saveRoomModelPath = async (sessionId: string, roomId: string, modelPath: string) => {
  try {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) {
      // Create new room if it doesn't exist
      return saveRoom(sessionId, roomId, {
        name: `Room ${roomId.substring(0, 4)}`,
        model_path: modelPath,
        processed: true
      });
    }
    
    const roomData = roomSnap.data();
    
    // Verify session ID matches
    if (roomData.sessionId !== sessionId) {
      throw new Error('Session ID mismatch');
    }
    
    // Update model path
    await updateDoc(roomRef, {
      model_path: modelPath,
      processed: true,
      updatedAt: new Date()
    });
    
    return {
      id: roomId,
      ...roomData,
      model_path: modelPath,
      processed: true
    };
  } catch (error) {
    console.error('Error saving room model path:', error);
    throw error;
  }
};

/**
 * Link a session to a homeowner
 * @param sessionId The session ID
 * @param homeownerId The homeowner ID
 */
export const linkSessionToHomeowner = async (sessionId: string, homeownerId: string): Promise<SessionData> => {
  try {
    const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
    const sessionSnap = await getDoc(sessionRef);
    
    if (!sessionSnap.exists()) {
      throw new Error('Session not found');
    }
    
    // Update session with homeowner ID
    await updateDoc(sessionRef, {
      homeownerId,
      lastActive: new Date()
    });
    
    return {
      id: sessionId,
      ...sessionSnap.data(),
      homeownerId
    } as SessionData;
  } catch (error) {
    console.error('Error linking session to homeowner:', error);
    throw error;
  }
};

/**
 * Link a session to a house
 * @param sessionId The session ID
 * @param houseId The house ID
 */
export const linkSessionToHouse = async (sessionId: string, houseId: string): Promise<SessionData> => {
  try {
    const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
    const sessionSnap = await getDoc(sessionRef);
    
    if (!sessionSnap.exists()) {
      throw new Error('Session not found');
    }
    
    // Update session with house ID
    await updateDoc(sessionRef, {
      houseId,
      lastActive: new Date()
    });
    
    return {
      id: sessionId,
      ...sessionSnap.data(),
      houseId
    } as SessionData;
  } catch (error) {
    console.error('Error linking session to house:', error);
    throw error;
  }
};

/**
 * Set the current room for a session
 * @param sessionId The session ID
 * @param roomId The room ID
 */
export const setCurrentRoom = async (sessionId: string, roomId: string): Promise<SessionData> => {
  try {
    const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
    const sessionSnap = await getDoc(sessionRef);
    
    if (!sessionSnap.exists()) {
      throw new Error('Session not found');
    }
    
    // Update session with current room ID
    await updateDoc(sessionRef, {
      currentRoomId: roomId,
      lastActive: new Date()
    });
    
    return {
      id: sessionId,
      ...sessionSnap.data(),
      currentRoomId: roomId
    } as SessionData;
  } catch (error) {
    console.error('Error setting current room:', error);
    throw error;
  }
};

/**
 * Get sessions by homeowner ID
 * @param homeownerId The homeowner ID
 * @returns Array of sessions
 */
export const getSessionsByHomeowner = async (homeownerId: string) => {
  try {
    const sessionsQuery = query(
      collection(db, SESSIONS_COLLECTION), 
      where('homeownerId', '==', homeownerId)
    );
    
    const querySnapshot = await getDocs(sessionsQuery);
    
    const sessions: Session[] = [];
    
    querySnapshot.forEach((doc) => {
      sessions.push({
        id: doc.id,
        ...doc.data()
      } as Session);
    });
    
    return sessions;
  } catch (error) {
    console.error('Error getting sessions by homeowner:', error);
    throw error;
  }
};
