import { Dispatch, useEffect, useState } from 'react';
import {
  doc,
  Firestore,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { Auth } from 'firebase/auth';

type TConfig = {
  loadingState: [boolean, Dispatch<boolean>];
  firestore: Firestore;
  currentUser: Auth['currentUser'] | null;
  userImageId: any;
};
export const usePreferencesAddress = (config: TConfig) => {
  const {
    loadingState: [isLoading, setLoading],
    currentUser,
    userImageId,
    firestore,
  } = config;
  const [address, setAddress] = useState('');

  useEffect(() => {
    const updateUserImageDoc = async () => {
      if (currentUser === null || !userImageId) return;
      setLoading(true); // Set loading state to true

      const userImageDocRef = doc(
        firestore,
        'userImages',
        userImageId
      );
      const paintPrefDocRef = doc(
        firestore,
        'paintPreferences',
        `${userImageId}-${currentUser.uid}`
      );

      const userImageDoc = await getDoc(userImageDocRef);
      if (userImageDoc.exists()) {
        const userId = userImageDoc.data().userId;
        const userDocRef = doc(firestore, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setAddress(userDoc.data().address);
        }
      }
    };

    updateUserImageDoc();
  }, []);

  useEffect(() => {
    const updateUserImageDoc = async () => {
      if (currentUser === null || !userImageId) return;
      setLoading(true);
      const userImageDocRef = doc(
        firestore,
        'userImages',
        userImageId
      );
      await updateDoc(userImageDocRef, {
        address: address,
      });
    };

    updateUserImageDoc();
  }, [address]);
};
