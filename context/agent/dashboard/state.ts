'use client';
import { useEffect, useRef, useState } from 'react';
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
import { useTimeoutRef } from '@/hooks/timeout-ref';
import { TAgentInfo, TPainterInviteData } from '@/types';

const INIT_LOADING_RECORD = {
  invite: null,
  add: null,
} as const;
type TLoadingRecord = Record<
  keyof typeof INIT_LOADING_RECORD,
  null | boolean
>;

export const useAgentDashboardState = () => {
  const timeoutRef = useTimeoutRef();
  const inputPhoneRef = useRef<HTMLInputElement | null>(
    null
  );
  const inputNameRef = useRef<HTMLInputElement | null>(
    null
  );
  const [preferredPainters, setPreferredPainters] =
    useState<TPainter[]>([]);
  const [loadingRecord, setLoadingRecord] =
    useState<TLoadingRecord>(INIT_LOADING_RECORD);

  const [inviteSuccess, setInviteSuccess] =
    useState<TPainterInviteData | null>(null);

  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingPainter, setAddingPainter] =
    useState(false);
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
  const handleUpdateLoadingRecord = (
    partial: Partial<TLoadingRecord>
  ) => {
    setLoadingRecord((prev) => ({ ...prev, ...partial }));
  };
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
        const errorMessage =
          'Failed to fetch recommended painters. Please try again later.';
        console.error(
          'Error fetching recommended painters:',
          error
        );
        setError(errorMessage);
        toast.error(errorMessage);
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

  const handleAddPainterStart = () => {
    setAddingPainter(true);
    timeoutRef.timeoutRef.current = setTimeout(() => {
      inputPhoneRef.current?.focus();
    }, 100);
  };

  const handleAddPainterCancel = () => {
    setNewPainterPhone('');
    setNewPainterName('');
    setAddingPainter(false);
    setError('');
    setSearchError('');
    setInviteSuccess(null);
  };

  const handleAddPainter = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser || !newPainterPhone) return;
    handleUpdateLoadingRecord({ add: true });
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
        if (
          preferredPainters.some(
            (v) => v.userId === painterData.userId
          )
        ) {
          const message =
            'This painter has already been added.';
          setError(message);
          toast.error(message);
          setSearchError('');
          return;
        }
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
          setNewPainterPhone('');
        }
        handleAddPainterCancel();

        // setSearchError('');
      } else {
        const message =
          'Painter not found. Please input name and we will send them an invite.';
        setSearchError(message);
        setError('');
        timeoutRef.timeoutRef.current = setTimeout(() => {
          inputNameRef.current?.focus();
        }, 100);
        toast.info(message);
      }
    } catch (error) {
      const errorMessage =
        'Error adding painter. Please try again later.';
      console.error('Error adding painter:', error);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      handleUpdateLoadingRecord({ add: null });
    }
  };

  const handleInvitePainter = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser || !newPainterPhone || !newPainterName)
      return;
    handleUpdateLoadingRecord({ invite: true });

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
        } as const;

        await setDoc(
          doc(firestore, 'painterInvites', newPainterPhone),
          inviteData
        );

        setInviteSuccess(inviteData);
      } else {
        const errorMessage =
          'Error sending invitation. Could not find user.';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        'Error inviting painter. Please try again later.';
      console.error('Error inviting painter:', error);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      handleUpdateLoadingRecord({ invite: null });
      setSearchError('');
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
    isAddingPainter,
    agentName,
    preferredPainters,
    newPainterName,
    newPainterPhone,
    searchError,
    inviteLink,
    loadingRecord,
    inputPhoneRef,
    inputNameRef,
    inviteSuccess,
    onInvitePainter: handleInvitePainter,
    dispatchPreferredPainters: setPreferredPainters,
    dispatchError: setError,
    dispatchNewPainterName: setNewPainterName,
    dispatchNewPainterPhone: setNewPainterPhone,
    dispatchSearchError: setSearchError,
    onGenerateInviteLink: handleGenerateInviteLink,
    onAddPainter: handleAddPainter,
    onAddPainterStart: handleAddPainterStart,
    onAddPainterCancel: handleAddPainterCancel,
    onUpdateLoadingRecord: handleUpdateLoadingRecord,
  };
};
