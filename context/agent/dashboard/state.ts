'use client';
import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  setDoc,
} from 'firebase/firestore';
import { useAuthNavigateHome } from '@/hooks/auth/navigate/home';
import { TPainter } from '@/context/agent/dashboard/types';
import { toast } from 'react-toastify';

export const useAgentDashboardState = () => {
  useAuthNavigateHome();

  const [preferredPainters, setPreferredPainters] =
    useState<TPainter[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingPainter, setAddingPainter] = useState(false);
  const [newPainterPhone, setNewPainterPhone] =
    useState('');
  const [newPainterName, setNewPainterName] = useState('');
  const [searchError, setSearchError] = useState<
    string | null
  >(null);
  const [inviteLink, setInviteLink] = useState('');
  const [agentName, setAgentName] = useState('');
  const auth = getAuth();
  const firestore = getFirestore();

  useEffect(() => {
    const fetchAgentName = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const agentDocRef = doc(
          firestore,
          'reAgents',
          currentUser.uid
        );
        const agentDoc = await getDoc(agentDocRef);
        if (agentDoc.exists()) {
          const agentData = agentDoc.data();
          setAgentName(agentData.name || 'Agent');
        }
      }
    };

    fetchAgentName();
  }, [auth, firestore]);

  useEffect(() => {
    const fetchPreferredPainters = async () => {
      setLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const agentDocRef = doc(
          firestore,
          'reAgents',
          currentUser.uid
        );
        const agentDoc = await getDoc(agentDocRef);

        if (agentDoc.exists()) {
          const agentData = agentDoc.data();
          const painterPhoneNumbers: string[] =
            agentData.preferredPainters || [];

          if (painterPhoneNumbers.length === 0) {
            setPreferredPainters([]);
            setLoading(false);
            return;
          }

          const batchSize = 10;
          let paintersList: TPainter[] = [];

          for (
            let i = 0;
            i < painterPhoneNumbers.length;
            i += batchSize
          ) {
            const batch = painterPhoneNumbers.slice(
              i,
              i + batchSize
            );
            const paintersQuery = query(
              collection(firestore, 'painters'),
              where('phoneNumber', 'in', batch)
            );
            const paintersSnapshot = await getDocs(
              paintersQuery
            );
            const batchPaintersList =
              paintersSnapshot.docs.map((doc) => ({
                userId: doc.id,
                ...doc.data(),
              })) as TPainter[];
            paintersList = [
              ...paintersList,
              ...batchPaintersList,
            ];
          }

          setPreferredPainters(paintersList);
        } else {
          setPreferredPainters([]);
        }
      } catch (error) {
        console.error(
          'Error fetching recommended painters:',
          error
        );
        setError(
          'Failed to fetch recommended painters. Please try again later.'
        );
      } finally {
        setLoading(false);
      }
    };

    // Check if user is authenticated before fetching data
    const unsubscribe = auth.onAuthStateChanged((user) => {
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
      const paintersQuery = query(
        collection(firestore, 'painters'),
        where('phoneNumber', '==', newPainterPhone)
      );
      const paintersSnapshot = await getDocs(paintersQuery);

      if (!paintersSnapshot.empty) {
        const painterDoc = paintersSnapshot.docs[0];
        const painterData = {
          userId: painterDoc.id,
          ...painterDoc.data(),
        } as TPainter;

        const agentDocRef = doc(
          firestore,
          'reAgents',
          currentUser.uid
        );
        const agentDoc = await getDoc(agentDocRef);

        if (agentDoc.exists()) {
          const agentData = agentDoc.data();
          const updatedPreferredPainters = [
            ...(agentData.preferredPainters || []),
            newPainterPhone,
          ];

          await updateDoc(agentDocRef, {
            preferredPainters: updatedPreferredPainters,
          });

          setPreferredPainters([
            ...preferredPainters,
            painterData,
          ]);
          setAddingPainter(false);
          setNewPainterPhone('');
        }
      } else {
        setSearchError(
          'Painter not found. Please input name and we will send them an invite.'
        );
      }
    } catch (error) {
      console.error('Error adding painter:', error);
      setSearchError(
        'Error adding painter. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInvitePainter = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser || !newPainterPhone || !newPainterName)
      return;

    setLoading(true);
    setSearchError(null);

    try {
      const agentDocRef = doc(
        firestore,
        'reAgents',
        currentUser.uid
      );
      const agentDoc = await getDoc(agentDocRef);

      if (agentDoc.exists()) {
        const agentData = agentDoc.data();
        const updatedPreferredPainters = [
          ...(agentData.preferredPainters || []),
          newPainterPhone,
        ];

        await updateDoc(agentDocRef, {
          preferredPainters: updatedPreferredPainters,
        });

        const inviteData = {
          name: newPainterName,
          phoneNumber: newPainterPhone,
          agentId: currentUser.uid,
        };

        await setDoc(
          doc(firestore, 'painterInvites', newPainterPhone),
          inviteData
        );

        setAddingPainter(false);
        setNewPainterPhone('');
        setNewPainterName('');
      }
    } catch (error) {
      console.error('Error inviting painter:', error);
      setSearchError(
        'Error inviting painter. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePainter = async (
    phoneNumber: string
  ) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const agentDocRef = doc(
        firestore,
        'reAgents',
        currentUser.uid
      );
      const agentDoc = await getDoc(agentDocRef);

      if (agentDoc.exists()) {
        const agentData = agentDoc.data();
        const updatedPreferredPainters =
          agentData.preferredPainters.filter(
            (p: string) => p !== phoneNumber
          );

        await updateDoc(agentDocRef, {
          preferredPainters: updatedPreferredPainters,
        });

        setPreferredPainters(
          preferredPainters.filter(
            (painter) => painter.phoneNumber !== phoneNumber
          )
        );
      }
    } catch (error) {
      console.error('Error removing painter:', error);
      setError(
        'Error removing painter. Please try again later.'
      );
    }
  };

  const handleGenerateInviteLink = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const inviteLink = `${window.location.origin}/signup?agentId=${currentUser.uid}`;
    setInviteLink(inviteLink);
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.info('Invite link copied to clipboard');
    } catch (error) {
      console.error('Failed to copy invite link: ', error);
    }
  };

  return {
    isLoading,
    error,
    addingPainter,
    agentName,
    preferredPainters,
    newPainterName,
    newPainterPhone,
    searchError,
    inviteLink,
    onInvitePainter: handleInvitePainter,
    dispatchAddingPainter: setAddingPainter,
    dispatchNewPainterName: setNewPainterName,
    dispatchNewPainterPhone: setNewPainterPhone,
    onGenerateInviteLink: handleGenerateInviteLink,
    onAddPainter: handleAddPainter,
    onRemovePainter: handleRemovePainter,
  };
};
