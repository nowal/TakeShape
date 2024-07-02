'use client';

import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import PainterCard from '../../components/painterCard';

// Define the type for Painter data
interface Painter {
  userId: string;
  name: string;
  phoneNumber: string;
  // Add other fields as necessary
}

export default function AgentDashboard() {
  const [preferredPainters, setPreferredPainters] = useState<Painter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingPainter, setAddingPainter] = useState(false);
  const [newPainterPhone, setNewPainterPhone] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const auth = getAuth();
  const firestore = getFirestore();

  useEffect(() => {
    const fetchPreferredPainters = async () => {
      setLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const agentDocRef = doc(firestore, 'reAgents', currentUser.uid);
        const agentDoc = await getDoc(agentDocRef);

        if (agentDoc.exists()) {
          const agentData = agentDoc.data();
          const painterPhoneNumbers: string[] = agentData.preferredPainters || [];

          if (painterPhoneNumbers.length === 0) {
            setPreferredPainters([]);
            setLoading(false);
            return;
          }

          const batchSize = 10;
          let paintersList: Painter[] = [];

          for (let i = 0; i < painterPhoneNumbers.length; i += batchSize) {
            const batch = painterPhoneNumbers.slice(i, i + batchSize);
            const paintersQuery = query(collection(firestore, 'painters'), where('phoneNumber', 'in', batch));
            const paintersSnapshot = await getDocs(paintersQuery);
            const batchPaintersList = paintersSnapshot.docs.map(doc => ({ userId: doc.id, ...doc.data() })) as Painter[];
            paintersList = [...paintersList, ...batchPaintersList];
          }

          setPreferredPainters(paintersList);
        } else {
          setPreferredPainters([]);
        }
      } catch (error) {
        console.error('Error fetching preferred painters:', error);
        setError('Failed to fetch preferred painters. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Check if user is authenticated before fetching data
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchPreferredPainters();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [auth, firestore]);

  const handleAddPainter = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser || !newPainterPhone) return;

    setLoading(true);
    setSearchError(null);

    try {
      const paintersQuery = query(collection(firestore, 'painters'), where('phoneNumber', '==', newPainterPhone));
      const paintersSnapshot = await getDocs(paintersQuery);

      if (!paintersSnapshot.empty) {
        const painterDoc = paintersSnapshot.docs[0];
        const painterData = { userId: painterDoc.id, ...painterDoc.data() } as Painter;

        const agentDocRef = doc(firestore, 'reAgents', currentUser.uid);
        const agentDoc = await getDoc(agentDocRef);

        if (agentDoc.exists()) {
          const agentData = agentDoc.data();
          const updatedPreferredPainters = [...(agentData.preferredPainters || []), newPainterPhone];

          await updateDoc(agentDocRef, {
            preferredPainters: updatedPreferredPainters
          });

          setPreferredPainters([...preferredPainters, painterData]);
          setAddingPainter(false);
          setNewPainterPhone('');
        }
      } else {
        setSearchError('Painter not found');
      }
    } catch (error) {
      console.error('Error adding painter:', error);
      setSearchError('Error adding painter. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePainter = async (phoneNumber: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const agentDocRef = doc(firestore, 'reAgents', currentUser.uid);
      const agentDoc = await getDoc(agentDocRef);

      if (agentDoc.exists()) {
        const agentData = agentDoc.data();
        const updatedPreferredPainters = agentData.preferredPainters.filter((p: string) => p !== phoneNumber);

        await updateDoc(agentDocRef, {
          preferredPainters: updatedPreferredPainters
        });

        setPreferredPainters(preferredPainters.filter(painter => painter.phoneNumber !== phoneNumber));
      }
    } catch (error) {
      console.error('Error removing painter:', error);
      setError('Error removing painter. Please try again later.');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-center text-2xl font-bold mb-6">Agent Dashboard</h1>
      
      <div className="flex justify-center mb-4">
        <button className="button-color hover:bg-green-900 text-white font-bold py-2 px-4 rounded">
          Get Invite Link
        </button>
      </div>

      <h2 className="text-xl text-center font-semibold mb-4">Preferred Painters</h2>
      
      <div className="flex justify-center mb-4">
        <button onClick={() => setAddingPainter(true)} className="button-color hover:bg-green-900 text-white font-bold py-2 px-4 rounded">
          Add new +
        </button>
      </div>

      {addingPainter && (
        <div className="mb-4">
          <input
            type="text"
            value={newPainterPhone}
            onChange={(e) => setNewPainterPhone(e.target.value)}
            placeholder="Painter Phone Number"
            className="p-2 border rounded w-full mb-2"
          />
          <button onClick={handleAddPainter} className="button-color hover:bg-green-900 text-white font-bold py-2 px-4 rounded">
            Submit
          </button>
          {searchError && <p className="text-red-600">{searchError}</p>}
        </div>
      )}

      <div>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : preferredPainters.length > 0 ? (
          preferredPainters.map((painter) => (
            <div key={painter.userId} className="flex items-center justify-between mb-4">
              <PainterCard painterId={painter.userId} />
              <button
                onClick={() => handleRemovePainter(painter.phoneNumber)}
                className="ml-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Remove
              </button>
            </div>
          ))
        ) : (
          <p className="text-center">No preferred painters added yet.</p>
        )}
      </div>
    </div>
  );
}
