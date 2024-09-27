import { useState, useEffect } from 'react';
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

export const useQuoteState = () => {
  const [currentStep, setCurrentStep] = useState(1);
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
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUserSignedIn, setIsUserLoggedIn] =
    useState(false); // State to keep track of user's authentication status
  const [fileUrl, setFileUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // Add errorMessage state
  const auth = getAuth();
  const router = useRouter();
  const firestore = getFirestore(firebase);
  const [, setUploadProgress] = useAtom(uploadProgressAtom);
  const [, setVideoURL] = useAtom(videoURLAtom);
  const [, setUploadStatus] = useAtom(uploadStatusAtom);
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
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPaintPreferences({
      ...paintPreferences,
      [e.target.name]: e.target.checked,
    });
  };

  const handlePrevious = async () => {
    setCurrentStep(1);
  };

  const handleCreateUserImage = async () => {
    console.log('Creating user image document');
    setIsLoading(true);
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
      console.error(
        'Error creating user image document: ',
        error
      );
      setErrorMessage(
        'Error creating user image document. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (file: File) => {
    if (auth.currentUser != null) {
      console.log(
        'Authenticated user UID: ',
        auth.currentUser.uid
      );
    } else {
      console.log('No authenticated user');
    }
    setIsUploading(true); // Move to the next step immediately without waiting for the upload to finish

    const storage = getStorage(firebase);
    const fileRef = storageRef(
      storage,
      `uploads/${file.name}`
    );
    const uploadTask = uploadBytesResumable(fileRef, file);

    handleCreateUserImage(); // Create the user image document immediately

    // Store the upload promise in the state or a ref
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Handle progress
        const progress =
          (snapshot.bytesTransferred /
            snapshot.totalBytes) *
          100;
        setUploadProgress(progress);
        setUploadStatus('uploading');
        console.log('Upload is ' + progress + '% done');
      },
      (error) => {
        console.error('Error uploading video: ', error);
        setErrorMessage(
          'Error uploading video. Please try again.'
        );
        setIsUploading(false);
      },
      async () => {
        // Handle successful uploads on complete
        const url = await getDownloadURL(
          uploadTask.snapshot.ref
        );
        console.log('File available at', url);
        setUploadStatus('completed');
        setFileUrl(url); // Save the URL once the upload is complete
        setVideoURL(url);
        setIsUploading(false);

        // Update the userImage document with the video URL
        const docId = sessionStorage.getItem('userImageId');
        if (docId) {
          await updateDoc(
            doc(firestore, 'userImages', docId),
            {
              video: url,
            }
          );
          console.log(
            `Updated userImage document ${docId} with video URL`
          );
        }
      }
    );
  };

  return {
    isLoading,
    isUploading,
    currentStep,
    title,
    onFileUpload: handleFileUpload,
    handleCreateUserImage,
    handleCheckboxChange,
    handlePrevious,
    dispatchTitle:setTitle
  };
};
