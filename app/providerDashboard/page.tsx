'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPainter, getPainterByUserId } from '@/utils/firestore/painter';
import { useAccountSettings } from '@/context/account-settings/provider';
import { getAuth } from 'firebase/auth';
import firebase from '@/lib/firebase';
import { getSession, getSessionRooms } from '@/utils/firestore/session';
import { getHomeowner } from '@/utils/firestore/homeowner';
import { getHouse } from '@/utils/firestore/house';
import { LeadCard, LeadData } from '@/components/providerDashboard/leadCard';
import { LeadStage } from '@/components/providerDashboard/progressBar';
import { Room, House } from '@/utils/firestore/house';

// Extend the House interface to include roomIds
interface ExtendedHouse extends House {
  roomIds?: string[];
}

export default function ProviderDashboardPage() {
  const router = useRouter();
  const [painterId, setPainterId] = useState<string | null>(null);
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the painter information from the authenticated user
  const { isPainter } = useAccountSettings();

  useEffect(() => {
    const fetchPainterId = async () => {
      try {
        setIsLoading(true);
        const auth = getAuth(firebase);
        const user = auth.currentUser;
        
        if (user && isPainter) {
          console.log('Fetching painter data for user:', user.uid);
          const painter = await getPainterByUserId(user.uid);
          
          if (painter && painter.id) {
            console.log('Found painter with ID:', painter.id);
            setPainterId(painter.id);
          } else {
            console.error('No painter found for user ID:', user.uid);
            setError('Painter data not found. Please complete your painter registration.');
            setIsLoading(false);
          }
        } else {
          console.error('User not authenticated or not a painter');
          setError('You must be logged in as a painter to view this dashboard.');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching painter ID:', err);
        setError('Failed to load painter data. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchPainterId();
  }, [isPainter]);

  // Fetch painter data and leads when painterId changes
  useEffect(() => {
    if (!painterId) return;

    const fetchLeads = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get the painter data
        const painter = await getPainter(painterId);
        if (!painter) {
          throw new Error('Painter not found');
        }

        // Get the sessions for this painter
        const sessionIds = painter.sessions || [];
        if (sessionIds.length === 0) {
          setLeads([]);
          setIsLoading(false);
          return;
        }

        // Fetch data for each session
        const leadsData: LeadData[] = [];
        
        for (const sessionId of sessionIds) {
          try {
            // Get session data
            const session = await getSession(sessionId);
            if (!session) continue;

            // Determine the lead's stage and name
            let stage: LeadStage = 'Visited';
            let name = `Lead ${sessionId.substring(0, 8)}`;
            let rooms: Room[] = [];

            // If session has a homeowner, get homeowner data
            if (session.homeownerId) {
              const homeowner = await getHomeowner(session.homeownerId);
              if (homeowner) {
                name = homeowner.name;
                stage = 'Want Consult';

                // If session has a house, get house data
                if (session.houseId) {
                  const houseData = await getHouse(session.houseId);
                  
                  // Cast to ExtendedHouse to access roomIds
                  const house = houseData as ExtendedHouse;
                  
                  // Check if the house has roomIds (new approach)
                  if (house && house.roomIds && house.roomIds.length > 0) {
                    console.log(`House ${house.id} has ${house.roomIds.length} roomIds`);
                    
                    // Fetch each room individually
                    const roomsData = await getSessionRooms(sessionId);
                    
                    // Filter rooms to only include those in the roomIds array
                    const houseRooms = house.roomIds
                      .map((roomId: string) => roomsData[roomId])
                      .filter((room: any) => room !== undefined)
                      .map((room: any) => ({
                        id: room.id,
                        name: room.name || 'Unnamed Room',
                        images: room.images || [],
                        model_path: room.model_path,
                        created_at: room.created_at,
                        updated_at: room.updated_at || room.created_at,
                        processed: room.processed || false
                      }));
                    
                    if (houseRooms.length > 0) {
                      rooms = houseRooms;
                      stage = 'Started TakeShape';
                    }
                  }
                }
              }
            }

            // Get rooms directly from the rooms collection
            if (rooms.length === 0) {
              const sessionRooms = await getSessionRooms(sessionId);
              if (Object.keys(sessionRooms).length > 0) {
                // Define a type for the room data
                interface RoomData {
                  id: string;
                  name?: string;
                  images?: string[];
                  model_path?: string;
                  created_at: any;
                  updated_at?: any;
                  processed?: boolean;
                }
                
                // Convert the rooms object to an array
                rooms = Object.values(sessionRooms).map((room: RoomData) => ({
                  id: room.id,
                  name: room.name || 'Unnamed Room',
                  images: room.images || [],
                  model_path: room.model_path,
                  created_at: room.created_at,
                  updated_at: room.updated_at || room.created_at,
                  processed: room.processed || false
                }));
                
                if (rooms.length > 0) {
                  stage = 'Started TakeShape';
                }
              }
            }

            // Add the lead data
            // Convert Firestore Timestamp to Date if needed
            const lastActive = session.lastActive instanceof Date 
              ? session.lastActive 
              : new Date(session.lastActive.seconds * 1000);
              
            leadsData.push({
              sessionId,
              name,
              stage,
              lastActive,
              rooms
            });
          } catch (sessionError) {
            console.error(`Error fetching data for session ${sessionId}:`, sessionError);
          }
        }

        // Sort leads by lastActive date (most recent first)
        leadsData.sort((a, b) => b.lastActive.getTime() - a.lastActive.getTime());

        setLeads(leadsData);
      } catch (err) {
        console.error('Error fetching leads:', err);
        setError('Failed to load leads. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeads();
  }, [painterId]);

  // Add a session ID to the painter for testing
  const addSessionToPainter = async () => {
    if (!painterId) {
      alert('Painter data not loaded yet. Please wait or refresh the page.');
      return;
    }
    
    try {
      // Fetch available sessions
      const sessionsResponse = await fetch('/api/sessions/list?limit=20');
      if (!sessionsResponse.ok) {
        throw new Error('Failed to fetch sessions');
      }
      
      const sessionsData = await sessionsResponse.json();
      const sessions = sessionsData.sessions || [];
      
      if (sessions.length === 0) {
        alert('No sessions found. Please create a session first by visiting the demo page.');
        return;
      }
      
      // Define a type for the session data
      interface SessionData {
        id: string;
        lastActive: string;
        createdAt: string;
        homeownerId: string | null;
        houseId: string | null;
        currentRoomId: string | null;
      }
      
      // Create options for the select dialog
      const options = sessions.map((session: SessionData) => {
        const homeownerInfo = session.homeownerId ? ` (Has Homeowner)` : '';
        const houseInfo = session.houseId ? ` (Has House)` : '';
        const date = new Date(session.lastActive).toLocaleString();
        return `${session.id} - Last active: ${date}${homeownerInfo}${houseInfo}`;
      });
      
      // Prompt user to select a session
      const selectedOption = prompt(
        `Select a session to add (enter the number):\n\n${
          options.map((option: string, index: number) => `${index + 1}. ${option}`).join('\n')
        }\n\nOr enter a custom session ID:`
      );
      
      if (!selectedOption) return;
      
      // Parse the selection
      let sessionId;
      const selectedIndex = parseInt(selectedOption, 10) - 1;
      if (!isNaN(selectedIndex) && selectedIndex >= 0 && selectedIndex < sessions.length) {
        // User selected from the list
        sessionId = sessions[selectedIndex].id;
      } else {
        // User entered a custom ID
        sessionId = selectedOption;
      }
      
      // Call the API to add the session to the painter
      const response = await fetch('/api/painter/addSession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          painterId,
          sessionId,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add session');
      }
      
      alert(`Session added successfully! Refresh the page to see the new lead.`);
      
      // Refresh the leads
      setIsLoading(true);
      const painter = await getPainter(painterId);
      if (!painter) {
        throw new Error('Painter not found');
      }
      
      // Trigger a re-fetch by setting the painter ID again
      setPainterId(null);
      setTimeout(() => setPainterId(painterId), 100);
      
    } catch (err) {
      console.error('Error adding session:', err);
      setError('Failed to add session. Please try again later.');
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to add session'}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Provider Dashboard</h1>
        <div className="flex space-x-4">
          {!painterId && error && (
            <button
              onClick={async () => {
                try {
                  const response = await fetch('/api/painter/createTest', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  });
                  
                  const data = await response.json();
                  
                  if (!response.ok) {
                    throw new Error(data.error || 'Failed to create test painter');
                  }
                  
                  alert(`Test painter created successfully with ID: ${data.painterId}`);
                  // Refresh the page to show the new painter
                  window.location.reload();
                } catch (err) {
                  console.error('Error creating test painter:', err);
                  alert(`Error: ${err instanceof Error ? err.message : 'Failed to create test painter'}`);
                }
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Create Test Painter
            </button>
          )}
          {painterId && (
            <>
              <button
                onClick={() => {
                  // Trigger a re-fetch by setting the painter ID again
                  const currentPainterId = painterId;
                  setPainterId(null);
                  setIsLoading(true);
                  setTimeout(() => setPainterId(currentPainterId), 100);
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Refresh Leads
              </button>
              <button
                onClick={() => router.push('/setPricing')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Set Pricing
              </button>
            </>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-8 rounded-lg text-center">
          <p className="text-xl mb-4">No leads found</p>
          <p className="text-gray-500">
            When customers visit your embedded TakeShape form, their information will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leads.map((lead) => (
            <LeadCard key={lead.sessionId} lead={lead} />
          ))}
        </div>
      )}
    </div>
  );
}
