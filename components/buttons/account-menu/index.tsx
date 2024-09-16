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
import { AccountMenuButton } from '@/components/buttons/account-menu/button';
import { cx } from 'class-variance-authority';
import { LinesHorizontalLight } from '@/components/lines/horizontal/light';
import { useOutsideClick } from '@/hooks/use-outside-click';

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
      <button
        onClick={handleDropdownOpenToggle}
        className={cx(
          'relative size-12',
          'flex items-center justify-center',
          'bg-white',
          'rounded-full',
          'shadow-md'
        )}
      >
        <AccountMenuButton
          isDropdownOpen={isDropdownOpen}
          isLoading={isLoading}
          profilePictureUrl={profilePictureUrl}
        />
      </button>
      {isDropdownOpen && (
        <ul
          className={cx(
            'flex flex-col items-stretch',
            'absolute right-0 top-full mt-2 w-48 z-20',
            'rounded-xl',
            'border border-gray-8',
            'bg-white',
            'drop-shadow-05',
            'overflow-hidden'
          )}
        >
          {(
            [
              ['Dashboard', handleDashboardClick],
              [
                'Manage Account',
                () => handleMenuClick('/accountSettings'),
              ],
              ['Sign Out', handleSignOut],
            ] as const
          ).map(([name, handler], index) => (
            <Fragment key={name}>
              {index !== 0 && <LinesHorizontalLight />}
              <li>
                <button
                  onClick={handler}
                  className={cx(
                    'text-left',
                    'w-full',
                    'p-2',
                    'drop-shadow-05',
                    'text-sm',
                    'hover:bg-white-1 hover:bg-opacity-50'
                  )}
                >
                  {name}
                </button>
              </li>
            </Fragment>
          ))}
        </ul>
      )}
    </div>
  );
};
