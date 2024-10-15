import { useEffect, useState } from 'react';
import {
  doc,
  getDoc,
  getFirestore,
  updateDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useSearchParams } from 'next/navigation';

export const useAccountSettingsAddress = () => {
  const [isAddressLoading, setAddressLoading] =
    useState(false);
  const [address, setAddress] = useState('');

  const searchParams = useSearchParams();
  const userImageId =
    typeof window !== 'undefined' &&
    (searchParams.get('userImageId') ||
      sessionStorage.getItem('userImageId'));

  const firestore = getFirestore();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const updateUserImageDoc = async () => {
      if (currentUser === null || !userImageId) return;

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

  return {
    isAddressLoading,
    address,
    dispatchAddressLoading: setAddressLoading,
    dispatchAddress: setAddress,
  };
};
