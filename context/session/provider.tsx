'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  getSession, 
  createSession, 
  updateSessionActivity,
  linkSessionToHomeowner,
  linkSessionToHouse,
  setCurrentRoom,
  SessionData
} from '@/utils/firestore/session';
import { getHomeowner } from '@/utils/firestore/homeowner';
import { getHouse } from '@/utils/firestore/house';

// Define the session context type
interface SessionContextType {
  sessionId: string;
  isLoading: boolean;
  homeownerId: string | null;
  houseId: string | null;
  currentRoomId: string | null;
  setHomeownerId: (id: string) => Promise<void>;
  setHouseId: (id: string) => Promise<void>;
  setCurrentRoomId: (id: string) => Promise<void>;
}

// Create the context
const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Create a hook to use the session context
export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

// Session provider props
interface SessionProviderProps {
  children?: React.ReactNode;
}

// Session provider component
export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [homeownerId, setHomeownerId] = useState<string | null>(null);
  const [houseId, setHouseId] = useState<string | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

  // Initialize session on component mount
  useEffect(() => {
    const initSession = async () => {
      try {
        setIsLoading(true);
        
        // Check if session ID exists in localStorage
        let id = localStorage.getItem('sessionId');
        
        if (!id) {
          // Create a new session ID
          id = uuidv4();
          localStorage.setItem('sessionId', id);
          
          // Create session in Firestore
          await createSession(id);
        } else {
          // Get existing session from Firestore
          const session = await getSession(id);
          
          if (!session) {
            // Session doesn't exist in Firestore, create it
            await createSession(id);
          } else {
            // Update session activity
            await updateSessionActivity(id);
            
            // Set homeowner and house IDs if they exist
            if (session.homeownerId) {
              setHomeownerId(session.homeownerId);
              
              // Get homeowner to check if they have houses
              const homeowner = await getHomeowner(session.homeownerId);
              if (homeowner && homeowner.houses && homeowner.houses.length > 0) {
                // If there's a house ID in the session, use it
                if (session.houseId) {
                  setHouseId(session.houseId);
                } else if (homeowner.houses.length === 1) {
                  // If there's only one house, use it
                  setHouseId(homeowner.houses[0]);
                  await linkSessionToHouse(id, homeowner.houses[0]);
                }
              }
            }
            
            // Set current room ID if it exists
            if (session.currentRoomId) {
              setCurrentRoomId(session.currentRoomId);
            }
          }
        }
        
        setSessionId(id);
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing session:', error);
        setIsLoading(false);
      }
    };
    
    initSession();
    
    // Set up interval to update session activity
    const activityInterval = setInterval(() => {
      const id = localStorage.getItem('sessionId');
      if (id) {
        updateSessionActivity(id).catch(console.error);
      }
    }, 5 * 60 * 1000); // Update every 5 minutes
    
    return () => {
      clearInterval(activityInterval);
    };
  }, []);
  
  // Function to set homeowner ID
  const handleSetHomeownerId = async (id: string) => {
    try {
      await linkSessionToHomeowner(sessionId, id);
      setHomeownerId(id);
      
      // Get homeowner to check if they have houses
      const homeowner = await getHomeowner(id);
      if (homeowner && homeowner.houses && homeowner.houses.length === 1) {
        // If there's only one house, use it
        await linkSessionToHouse(sessionId, homeowner.houses[0]);
        setHouseId(homeowner.houses[0]);
      }
    } catch (error) {
      console.error('Error setting homeowner ID:', error);
    }
  };
  
  // Function to set house ID
  const handleSetHouseId = async (id: string) => {
    try {
      await linkSessionToHouse(sessionId, id);
      setHouseId(id);
    } catch (error) {
      console.error('Error setting house ID:', error);
    }
  };
  
  // Function to set current room ID
  const handleSetCurrentRoomId = async (id: string) => {
    try {
      await setCurrentRoom(sessionId, id);
      setCurrentRoomId(id);
    } catch (error) {
      console.error('Error setting current room ID:', error);
    }
  };
  
  // Create the context value
  const contextValue: SessionContextType = {
    sessionId,
    isLoading,
    homeownerId,
    houseId,
    currentRoomId,
    setHomeownerId: handleSetHomeownerId,
    setHouseId: handleSetHouseId,
    setCurrentRoomId: handleSetCurrentRoomId
  };
  
  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
};

export default SessionProvider;
