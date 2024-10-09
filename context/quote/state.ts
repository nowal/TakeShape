import { useState, useEffect } from 'react';
import {
  getFirestore,
  doc,
  getDoc,
} from 'firebase/firestore';
import firebase from '@/lib/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useQuoteUpload } from '@/context/quote/upload';
import { useQuoteSubmit } from '@/context/quote/submit';
import { useAuth } from '@/context/auth/provider';

export const useQuoteState = () => {
  const { dispatchUserSignedIn } = useAuth();
  const [title, setTitle] = useState(''); // New title state
  const [zipCode, setZipCode] = useState('');
  const [paintPreferences, setPaintPreferences] = useState({
    walls: false,
    ceilings: false,
    trim: false,
  });
  const [errorMessage, setErrorMessage] = useState(''); // Add errorMessage state
  const auth = getAuth();
  const firestore = getFirestore(firebase);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        dispatchUserSignedIn(Boolean(user));
        if (user) {
          const userDocRef = doc(
            firestore,
            'users',
            user.uid
          );
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setZipCode(userData.zipCode || ''); // Prepopulate the zip code if it exists
          }
        }
      }
    );
    return () => {
      unsubscribe(); // Unsubscribe on component unmount
    };
  }, [auth, firestore]);

  const quoteSubmit = useQuoteSubmit({
    zipCode,
    paintPreferences,
    title,
    dispatchErrorMessage: setErrorMessage,
  });

  const { onUpload, ...quoteUpload } = useQuoteUpload({
    auth,
    firestore,
    dispatchErrorMessage: setErrorMessage,
  });

  return {
    title,
    errorMessage,
    onFileUpload: onUpload,
    dispatchTitle: setTitle,
    ...quoteUpload,
    ...quoteSubmit,
  };
};
