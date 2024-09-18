'use client';

import { useState, useEffect, Fragment } from 'react';
import { useRouter } from 'next/navigation';
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
import { AccountMenuIcon } from '@/components/buttons/account-menu/icon';
import { cx } from 'class-variance-authority';
import { LinesHorizontalLight } from '@/components/lines/horizontal/light';
import { useOutsideClick } from '@/hooks/use-outside-click';
import { AccountMenuList } from '@/components/buttons/account-menu/list';
import { ButtonsCvaButton } from '@/components/cva/button';

export const AccountMenu = () => {
  const [profilePictureUrl, setProfilePictureUrl] =
    useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isPainter, setPainter] = useState(false);
  const [isAgent, setAgent] = useState(false);
  const router = useRouter();
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
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
    sessionStorage.clear();
  };

  const handleDropdownOpenToggle = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleDropdownClose = () => setDropdownOpen(false);

  const handleMenuClick = (path: string) => {
    router.push(path);
    handleDropdownClose();
  };

  const handleDashboardClick = () => {
    if (isAgent) {
      handleMenuClick('/agentDashboard');
    } else {
      handleMenuClick('/dashboard');
    }
  };

  const outsideClickRef = useOutsideClick(
    handleDropdownClose
  );

  return (
    <div ref={outsideClickRef}>
      <ButtonsCvaButton
        title="Title Open"
        onTap={handleDropdownOpenToggle}
        classValue={cx('bg-white', 'shadow-md', 'z-10')}
        rounded="full"
        size="iconXl"
        intent='icon'
        center
      >
        <AccountMenuIcon
          isDropdownOpen={isDropdownOpen}
          isLoading={isLoading}
          profilePictureUrl={profilePictureUrl}
        />
      </ButtonsCvaButton>
      {isDropdownOpen && (
        <AccountMenuList
          items={
            [
              ['Dashboard', handleDashboardClick],
              [
                'Manage Account',
                () => handleMenuClick('/accountSettings'),
              ],
              ['Sign Out', handleSignOut],
            ] as const
          }
        />
      )}
    </div>
  );
};
