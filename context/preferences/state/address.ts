import { Dispatch, useEffect, useState } from 'react';
import {
  doc,
  Firestore,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { useAuth } from '@/context/auth/provider';

type TConfig = {
  loadingState: [boolean, Dispatch<boolean>];
  firestore: Firestore;
  currentUser: Auth['currentUser'] | null;
  userImageId: any;
};
export const usePreferencesStateAddress = (
  config: TConfig
) => {
  const {
    loadingState: [isLoading, setLoading],
    currentUser,
    userImageId,
    firestore,
  } = config;
  const [address, setAddress] = useState('');
  const auth = useAuth();
  console.log(auth);
  const { isUserSignedIn, signIn } = auth;
  useEffect(() => {
    console.log('MOUNT DOC ADDRESS SIDE EFFECT');

    const updateUserImageDoc = async () => {
      console.log(
        'usePreferencesStateAddress.useEffect.updateUserImageDoc.0'
      );
      console.log(currentUser, userImageId);

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
    console.log('ADDRESS CHANGE SIDE EFFECT');
    const updateUserImageDoc = async () => {
      console.log(
        'usePreferencesStateAddress.useEffect.updateUserImageDoc.1'
      );
      console.log(currentUser, userImageId);

      if (currentUser === null || !userImageId) return;
      setLoading(true);
      const userImageDocRef = doc(
        firestore,
        'userImages',
        userImageId
      );
      await updateDoc(userImageDocRef, {
        address,
      });
    };

    updateUserImageDoc();
  }, [address]);

  return { address, dispatchAddress: setAddress };
};
