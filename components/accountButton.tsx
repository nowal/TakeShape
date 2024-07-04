'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

export default function AccountButton() {
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isPainter, setIsPainter] = useState(false);
  const [isAgent, setIsAgent] = useState(false);
  const router = useRouter();
  const auth = getAuth();
  const firestore = getFirestore();
  const storage = getStorage();
  const RETRY_INTERVAL = 2000; // Retry every 2 seconds
  const MAX_RETRIES = 5; // Maximum number of retries

  const fetchProfilePicture = async (retries = 0) => {
    setIsLoading(true);
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    try {
      // Check if the user is a painter
      const painterQuery = query(collection(firestore, 'painters'), where('userId', '==', currentUser.uid));
      const painterSnapshot = await getDocs(painterQuery);

      if (!painterSnapshot.empty) {
        setIsPainter(true);
        const painterData = painterSnapshot.docs[0].data();
        if (painterData.logoUrl) {
          setProfilePictureUrl(painterData.logoUrl);
          setIsLoading(false);
          return;
        }
      } else {
        setIsPainter(false);
      }

      // Check if the user is an agent
      const agentDocRef = doc(firestore, 'reAgents', currentUser.uid);
      const agentDoc = await getDoc(agentDocRef);

      if (agentDoc.exists()) {
        setIsAgent(true);
        const agentData = agentDoc.data();
        if (agentData.profilePictureUrl) {
          setProfilePictureUrl(agentData.profilePictureUrl);
          setIsLoading(false);
          return;
        } else {
          const profilePictureRef = ref(storage, `profilePictures/${currentUser.uid}`);
          const url = await getDownloadURL(profilePictureRef);
          setProfilePictureUrl(url);
          setIsLoading(false);
          return;
        }
      } else {
        setIsAgent(false);
      }

      // Retry fetching profile picture if not found and retry limit not reached
      if (retries < MAX_RETRIES) {
        setTimeout(() => fetchProfilePicture(retries + 1), RETRY_INTERVAL);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching profile picture:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfilePicture();
  }, [auth, firestore, storage]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
    sessionStorage.clear();
  };

  const handleButtonClick = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleMenuClick = (path: string) => {
    router.push(path);
    setDropdownOpen(false);
  };

  const handleDashboardClick = () => {
    if (isAgent) {
      handleMenuClick('/agentDashboard');
    } else {
      handleMenuClick('/dashboard');
    }
  };

  return (
    <div className="relative">
      <button onClick={handleButtonClick} className="relative w-16 h-16 rounded-full overflow-hidden">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="hamburger-icon w-8 h-8 flex flex-col justify-between">
              <span className="block w-full h-1 bg-black"></span>
              <span className="block w-full h-1 bg-black"></span>
              <span className="block w-full h-1 bg-black"></span>
            </div>
          </div>
        ) : profilePictureUrl ? (
          <img src={profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="hamburger-icon w-8 h-8 flex flex-col justify-between">
              <span className="block w-full h-1 bg-black"></span>
              <span className="block w-full h-1 bg-black"></span>
              <span className="block w-full h-1 bg-black"></span>
            </div>
          </div>
        )}
      </button>
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
          <button onClick={handleDashboardClick} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
            Dashboard
          </button>
          <button onClick={() => handleMenuClick('/accountSettings')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
            Manage Account
          </button>
          <button onClick={handleSignOut} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
