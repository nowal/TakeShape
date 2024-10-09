import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  uploadProgressAtom,
  uploadStatusAtom,
  videoURLAtom,
  documentIdAtom,
} from '@/atom';
import { useAtom } from 'jotai';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  arrayUnion,
  doc,
  getDoc,
} from 'firebase/firestore';
import firebase from '@/lib/firebase';
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { notifyError } from '@/utils/notifications';
import { useQuoteUpload } from '@/context/quote/upload';

export const useQuoteState = () => {
  const [zipCode, setZipCode] = useState('');
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState(''); // New title state
  const [paintPreferences, setPaintPreferences] = useState({
    walls: false,
    ceilings: false,
    trim: false,
  });
  const [providingOwnPaint, setProvidingOwnPaint] =
    useState('');
  const [isLoading, setLoading] = useState(false);
  const [isUserSignedIn, setIsUserLoggedIn] =
    useState(false); // State to keep track of user's authentication status
  const [errorMessage, setErrorMessage] = useState(''); // Add errorMessage state
  const auth = getAuth();
  const router = useRouter();
  const firestore = getFirestore(firebase);

  const [, setDocumentId] = useAtom(documentIdAtom);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        setIsUserLoggedIn(!!user);
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

  const handleCheckboxChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setPaintPreferences({
      ...paintPreferences,
      [event.target.name]: event.target.checked,
    });
  };

  const handleSubmit = async () => {
    console.log('Creating user image document');
    setLoading(true);
    setErrorMessage('');

    try {
      const userImageData = {
        zipCode,
        description,
        paintPreferences,
        providingOwnPaint,
        prices: [],
        video: '', // Initially empty video field
        title, // Add title to userImage
        userId: auth.currentUser
          ? auth.currentUser.uid
          : '',
      };

      console.log('User Image Data: ', userImageData);

      // Add the new quote
      const docRef = await addDoc(
        collection(firestore, 'userImages'),
        userImageData
      );
      console.log('Document written with ID:', docRef.id);
      setDocumentId(docRef.id);
      sessionStorage.setItem('userImageId', docRef.id); // Store userImageId in sessionStorage

      if (auth.currentUser) {
        const userDocRef = doc(
          firestore,
          'users',
          auth.currentUser.uid
        );
        await updateDoc(userDocRef, {
          userImages: arrayUnion(docRef.id),
        });
      }

      if (isUserSignedIn) {
        console.log(
          'Navigating to defaultPreferences with userImageId: ',
          docRef.id
        );
        router.push(
          `/defaultPreferences?userImageId=${docRef.id}`
        ); // Navigate to defaultPreferences with userImageId
      } else {
        // Handle non-logged-in user case
        sessionStorage.setItem(
          'quoteData',
          JSON.stringify(userImageData)
        );
        router.push(`/signup?userImageId=${docRef.id}`);
      }
    } catch (error) {
      const errorMessage =
        'Error creating user image document. Please try again.';
      notifyError(errorMessage);
      console.error(
        'Error creating user image document: ',
        error
      );
      setErrorMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const { fileName, isUploading, onUpload } =
    useQuoteUpload({
      auth,
      firestore,
      dispatchErrorMessage: setErrorMessage,
    });

  return {
    fileName,
    isLoading,
    isUploading,
    title,
    onFileUpload: onUpload,
    onSubmit: handleSubmit,
    handleCheckboxChange,
    dispatchTitle: setTitle,
  };
};
