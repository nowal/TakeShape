'use client';
import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  query,
  collection,
  where,
  getDocs,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  getDownloadURL,
} from 'firebase/storage';
import { useOutsideClick } from '@/hooks/outside-click';
import { TAuthConfig } from '@/context/auth/types';
import { isAgentAtom, isPainterAtom } from '@/atom';
import { useAtom } from 'jotai';
import { useApp } from '@/context/app/provider';
import firebase from '@/lib/firebase';

export const useAuthMenu = (config: TAuthConfig) => {
  const { onNavigateScrollTopClick } = useApp();
  const { dispatchProfilePictureUrl } = config;
  const [isFetchingProfilePicture, setFetchingProfilePicture] = useState(true);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isPainter, setPainter] = useAtom(isPainterAtom);
  const [isAgent, setAgent] = useAtom(isAgentAtom);
  const auth = getAuth(firebase);
  const firestore = getFirestore(firebase);
  const storage = getStorage(firebase);
  const RETRY_INTERVAL = 2000; // Retry every 2 seconds
  const MAX_RETRIES = 5; // Maximum number of retries

  const fetchProfilePicture = async (retries = 0) => {
    try {
      setFetchingProfilePicture(true);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.log('no current user');
        return;
      }

      // Check if the user is a painter
      const painterQuery = query(
        collection(firestore, 'painters'),
        where('userId', '==', currentUser.uid)
      );
      const painterSnapshot = await getDocs(painterQuery);

      if (!painterSnapshot.empty) {
        setPainter(true);
        const painterData = painterSnapshot.docs[0].data();
        if (painterData.logoUrl) {
          dispatchProfilePictureUrl(painterData.logoUrl);
          setFetchingProfilePicture(false);
          return;
        }
      } else {
        setPainter(false);
      }

      // Check if the user is an agent
      const agentDocRef = doc(
        firestore,
        'reAgents',
        currentUser.uid
      );
      const agentDoc = await getDoc(agentDocRef);

      if (agentDoc.exists()) {
        setAgent(true);
        const agentData = agentDoc.data();
        if (agentData.profilePictureUrl) {
          dispatchProfilePictureUrl(
            agentData.profilePictureUrl
          );
          return;
        } else {
          const profilePictureRef = ref(
            storage,
            `profilePictures/${currentUser.uid}`
          );
          const url = await getDownloadURL(
            profilePictureRef
          );
          dispatchProfilePictureUrl(url);
          return;
        }
      } else {
        setAgent(false);
      }

      // Retry fetching profile picture if not found and retry limit not reached
      if (retries < MAX_RETRIES) {
        setTimeout(
          () => fetchProfilePicture(retries + 1),
          RETRY_INTERVAL
        );
      }
    } catch (error) {
      console.error(
        'Error fetching profile picture:',
        error
      );
    } finally {
      setFetchingProfilePicture(false);
    }
  };

  useEffect(() => {
    fetchProfilePicture();
  }, [auth, firestore, storage]);

  const handleMenuOpenToggle = () => {
    setMenuOpen((prev) => !prev);
  };

  const handleDropdownClose = () => setMenuOpen(false);

  const handleDashboardClick = async () => {
    if (isAgent) {
      onNavigateScrollTopClick('/agentDashboard');
    } else {
      onNavigateScrollTopClick('/dashboard');
    }
    window.scrollTo(0, 0);
    handleDropdownClose();
  };
  const outsideClickRef = useOutsideClick(
    handleDropdownClose
  );

  return {
    isMenuOpen,
    isFetchingProfilePicture,
    outsideClickRef,
    onMenuOpenToggle: handleMenuOpenToggle,
    onDashboardClick: handleDashboardClick,
    dispatchMenuOpen: setMenuOpen,
  };
};
