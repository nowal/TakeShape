'use client';;
import { useState, useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';
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
import { isAgentAtom, isPainterAtom, isProfilePicAtom } from '@/atom';
import { useAtom } from 'jotai';

export const useAuthMenu = (config: TAuthConfig) => {
  const { onNavigateScrollTopClick, dispatchUserSignedIn } =
    config;
  const [profilePictureSrc, setProfilePictureUrl] = useAtom(isProfilePicAtom);
  const [isLoading, setLoading] = useState(true);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isPainter, setPainter] = useAtom(isPainterAtom);
  const [isAgent, setAgent] = useAtom(isAgentAtom);
  const auth = getAuth();
  const firestore = getFirestore();
  const storage = getStorage();
  const RETRY_INTERVAL = 2000; // Retry every 2 seconds
  const MAX_RETRIES = 5; // Maximum number of retries

  const fetchProfilePicture = async (retries = 0) => {
    setLoading(true);
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
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
          setProfilePictureUrl(painterData.logoUrl);
          setLoading(false);
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
          setProfilePictureUrl(agentData.profilePictureUrl);
          setLoading(false);
          return;
        } else {
          const profilePictureRef = ref(
            storage,
            `profilePictures/${currentUser.uid}`
          );
          const url = await getDownloadURL(
            profilePictureRef
          );
          setProfilePictureUrl(url);
          setLoading(false);
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
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error(
        'Error fetching profile picture:',
        error
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfilePicture();
  }, [auth, firestore, storage]);

  const handleSignOut = async () => {
    console.log('SIGN OUT');
    try {
      await signOut(auth);
      dispatchUserSignedIn(false);
      onNavigateScrollTopClick('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
    sessionStorage.clear();
  };

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
    isLoading,
    profilePictureSrc,
    outsideClickRef,
    onMenuOpenToggle: handleMenuOpenToggle,
    onDashboardClick: handleDashboardClick,
    onSignOut: handleSignOut,
    dispatchMenuOpen: setMenuOpen,
  };
};
