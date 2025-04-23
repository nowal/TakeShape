import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, query, where, getDocs, arrayUnion, Timestamp } from 'firebase/firestore';
import firebaseApp from '@/lib/firebase';

// Initialize Firestore
const db = getFirestore(firebaseApp);

// Collection names
const HOUSES_COLLECTION = 'houses';

// Room interface
export interface Room {
  id: string;
  name: string;
  images: string[];
  model_path?: string;
  created_at: Date | Timestamp;
  updated_at: Date | Timestamp;
  processed?: boolean;
}

// AddOn interface
export interface AddOn {
  name: string;
  price: number;
  roomId: string;
}

// House interface
export interface House {
  id?: string;
  address: string;
  homeownerId: string;
  rooms: Room[];
  addOns?: AddOn[];
  submitted?: boolean;
  accepted?: boolean;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

/**
 * Get a house by ID
 * @param houseId The house ID
 * @returns The house data or null if not found
 */
export const getHouse = async (houseId: string) => {
  try {
    const houseRef = doc(db, HOUSES_COLLECTION, houseId);
    const houseSnap = await getDoc(houseRef);
    
    if (houseSnap.exists()) {
      return {
        id: houseSnap.id,
        ...houseSnap.data()
      } as House;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting house:', error);
    throw error;
  }
};

/**
 * Get houses by homeowner ID
 * @param homeownerId The homeowner ID
 * @returns Array of houses
 */
export const getHousesByHomeowner = async (homeownerId: string) => {
  try {
    const housesQuery = query(
      collection(db, HOUSES_COLLECTION), 
      where('homeownerId', '==', homeownerId)
    );
    
    const querySnapshot = await getDocs(housesQuery);
    
    const houses: House[] = [];
    
    querySnapshot.forEach((doc) => {
      houses.push({
        id: doc.id,
        ...doc.data()
      } as House);
    });
    
    return houses;
  } catch (error) {
    console.error('Error getting houses by homeowner:', error);
    throw error;
  }
};

/**
 * Create a new house
 * @param houseData The house data
 * @returns The created house data
 */
export const createHouse = async (houseData: { address: string; homeownerId: string }) => {
  try {
    // Create a new document reference with auto-generated ID
    const houseRef = doc(collection(db, HOUSES_COLLECTION));
    
    // Add timestamps and initialize rooms array
    const dataToSave = {
      ...houseData,
      rooms: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Save to Firestore
    await setDoc(houseRef, dataToSave);
    
    // Return the created house with ID
    return {
      id: houseRef.id,
      ...dataToSave
    } as House;
  } catch (error) {
    console.error('Error creating house:', error);
    throw error;
  }
};

/**
 * Add a room to a house
 * @param houseId The house ID
 * @param roomData The room data
 * @returns The updated house data
 */
export const addRoomToHouse = async (houseId: string, roomData: Omit<Room, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const houseRef = doc(db, HOUSES_COLLECTION, houseId);
    const houseSnap = await getDoc(houseRef);
    
    if (!houseSnap.exists()) {
      throw new Error('House not found');
    }
    
    const house = houseSnap.data() as House;
    
    // Create a new room with ID and timestamps
    const newRoom: Room = {
      id: doc(collection(db, 'rooms')).id, // Generate a unique ID
      ...roomData,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    // Add the room to the house
    const updatedRooms = [...(house.rooms || []), newRoom];
    
    // Update the house
    await updateDoc(houseRef, {
      rooms: updatedRooms,
      updatedAt: new Date()
    });
    
    // Return the updated house
    return {
      id: houseId,
      ...house,
      rooms: updatedRooms,
      updatedAt: new Date()
    } as House;
  } catch (error) {
    console.error('Error adding room to house:', error);
    throw error;
  }
};

/**
 * Update a room in a house
 * @param houseId The house ID
 * @param roomId The room ID
 * @param roomData The room data to update
 * @returns The updated house data
 */
export const updateRoomInHouse = async (houseId: string, roomId: string, roomData: Partial<Omit<Room, 'id' | 'created_at' | 'updated_at'>>) => {
  try {
    const houseRef = doc(db, HOUSES_COLLECTION, houseId);
    const houseSnap = await getDoc(houseRef);
    
    if (!houseSnap.exists()) {
      throw new Error('House not found');
    }
    
    const house = houseSnap.data() as House;
    
    // Find the room
    const roomIndex = house.rooms.findIndex(room => room.id === roomId);
    
    if (roomIndex === -1) {
      throw new Error('Room not found in house');
    }
    
    // Update the room
    const updatedRoom = {
      ...house.rooms[roomIndex],
      ...roomData,
      updated_at: new Date()
    };
    
    // Replace the room in the array
    const updatedRooms = [...house.rooms];
    updatedRooms[roomIndex] = updatedRoom;
    
    // Update the house
    await updateDoc(houseRef, {
      rooms: updatedRooms,
      updatedAt: new Date()
    });
    
    // Return the updated house
    return {
      id: houseId,
      ...house,
      rooms: updatedRooms,
      updatedAt: new Date()
    } as House;
  } catch (error) {
    console.error('Error updating room in house:', error);
    throw error;
  }
};

/**
 * Get a room from a house
 * @param houseId The house ID
 * @param roomId The room ID
 * @returns The room data or null if not found
 */
export const getRoomFromHouse = async (houseId: string, roomId: string) => {
  try {
    const house = await getHouse(houseId);
    
    if (!house) {
      return null;
    }
    
    const room = house.rooms.find(room => room.id === roomId);
    
    return room || null;
  } catch (error) {
    console.error('Error getting room from house:', error);
    throw error;
  }
};

/**
 * Add an image to a room
 * @param houseId The house ID
 * @param roomId The room ID
 * @param imagePath The image path to add
 * @returns The updated room
 */
export const addImageToRoom = async (houseId: string, roomId: string, imagePath: string) => {
  try {
    const house = await getHouse(houseId);
    
    if (!house) {
      throw new Error('House not found');
    }
    
    const roomIndex = house.rooms.findIndex(room => room.id === roomId);
    
    if (roomIndex === -1) {
      throw new Error('Room not found in house');
    }
    
    // Get the current room
    const room = house.rooms[roomIndex];
    
    // Check if the image is already in the room
    if (room.images.includes(imagePath)) {
      return room;
    }
    
    // Add the image to the room
    const updatedRoom = {
      ...room,
      images: [...room.images, imagePath],
      updated_at: new Date()
    };
    
    // Update the room in the house
    const updatedHouse = await updateRoomInHouse(houseId, roomId, {
      images: updatedRoom.images
    });
    
    // Return the updated room
    return updatedHouse.rooms[roomIndex];
  } catch (error) {
    console.error('Error adding image to room:', error);
    throw error;
  }
};

/**
 * Set the model path for a room
 * @param houseId The house ID
 * @param roomId The room ID
 * @param modelPath The model path
 * @returns The updated room
 */
export const setRoomModelPath = async (houseId: string, roomId: string, modelPath: string) => {
  try {
    const updatedHouse = await updateRoomInHouse(houseId, roomId, {
      model_path: modelPath,
      processed: true
    });
    
    const roomIndex = updatedHouse.rooms.findIndex(room => room.id === roomId);
    
    if (roomIndex === -1) {
      throw new Error('Room not found after update');
    }
    
    return updatedHouse.rooms[roomIndex];
  } catch (error) {
    console.error('Error setting room model path:', error);
    throw error;
  }
};

/**
 * Add an add-on to a house
 * @param houseId The house ID
 * @param addOn The add-on to add
 * @returns The updated house data
 */
export const addAddOnToHouse = async (houseId: string, addOn: AddOn) => {
  try {
    const houseRef = doc(db, HOUSES_COLLECTION, houseId);
    const houseSnap = await getDoc(houseRef);
    
    if (!houseSnap.exists()) {
      throw new Error('House not found');
    }
    
    const house = houseSnap.data() as House;
    
    // Initialize addOns array if it doesn't exist
    const currentAddOns = house.addOns || [];
    
    // Add the new add-on
    const updatedAddOns = [...currentAddOns, addOn];
    
    // Update the house
    await updateDoc(houseRef, {
      addOns: updatedAddOns,
      updatedAt: new Date()
    });
    
    // Return the updated house
    return {
      id: houseId,
      ...house,
      addOns: updatedAddOns,
      updatedAt: new Date()
    } as House;
  } catch (error) {
    console.error('Error adding add-on to house:', error);
    throw error;
  }
};

/**
 * Mark a house as submitted
 * @param houseId The house ID
 * @returns The updated house data
 */
export const markHouseAsSubmitted = async (houseId: string) => {
  try {
    const houseRef = doc(db, HOUSES_COLLECTION, houseId);
    const houseSnap = await getDoc(houseRef);
    
    if (!houseSnap.exists()) {
      throw new Error('House not found');
    }
    
    const house = houseSnap.data() as House;
    
    // Update the house
    await updateDoc(houseRef, {
      submitted: true,
      updatedAt: new Date()
    });
    
    // Return the updated house
    return {
      id: houseId,
      ...house,
      submitted: true,
      updatedAt: new Date()
    } as House;
  } catch (error) {
    console.error('Error marking house as submitted:', error);
    throw error;
  }
};

/**
 * Mark a house as accepted
 * @param houseId The house ID
 * @returns The updated house data
 */
export const markHouseAsAccepted = async (houseId: string) => {
  try {
    const houseRef = doc(db, HOUSES_COLLECTION, houseId);
    const houseSnap = await getDoc(houseRef);
    
    if (!houseSnap.exists()) {
      throw new Error('House not found');
    }
    
    const house = houseSnap.data() as House;
    
    // Update the house
    await updateDoc(houseRef, {
      accepted: true,
      updatedAt: new Date()
    });
    
    // Return the updated house
    return {
      id: houseId,
      ...house,
      accepted: true,
      updatedAt: new Date()
    } as House;
  } catch (error) {
    console.error('Error marking house as accepted:', error);
    throw error;
  }
};
