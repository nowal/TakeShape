import {
  Dispatch,
  FormEventHandler,
  useState,
} from 'react';
import { documentIdAtom } from '@/atom';
import { useAtom } from 'jotai';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  arrayUnion,
  doc,
} from 'firebase/firestore';
import firebase from '@/lib/firebase';
import { getAuth } from 'firebase/auth';
import { notifyError } from '@/utils/notifications';
import { useAuth } from '@/context/auth/provider';
import { useDashboard } from '@/context/dashboard/provider';
import { useTimeoutRef } from '@/hooks/timeout-ref';
import { useApp } from '@/context/app/provider';
import { TPaintPreferences } from '@/types/preferences';

type TConfig = {
  quoteTitle: string;
  zipCode: string;
  paintPreferences: TPaintPreferences;
  dispatchErrorMessage: Dispatch<string>;
  dispatchTitle: Dispatch<string>;
};
export const useQuoteSubmit = ({
  quoteTitle,
  zipCode,
  paintPreferences,
  dispatchTitle,
  dispatchErrorMessage,
}: TConfig) => {
  const { onNavigateScrollTopClick } = useApp();
  const { timeoutRef } = useTimeoutRef();
  const { isUserSignedIn } = useAuth();
  const [isQuoteSubmitting, setQuoteSubmitting] =
    useState(false);
  const [providingOwnPaint, setProvidingOwnPaint] =
    useState('');
  const auth = getAuth();
  const firestore = getFirestore(firebase);
  const {
    dispatchUserImageList,
    onQuoteChange,
    dispatchUserData,
  } = useDashboard();

  const [, setDocumentId] = useAtom(documentIdAtom);

  const handler: FormEventHandler = async (event) => {
    event.preventDefault();
    console.log('Creating user image document');
    dispatchErrorMessage('');

    try {
      setQuoteSubmitting(true);
      const userImageData = {
        zipCode,
        description: '',
        paintPreferences,
        providingOwnPaint,
        prices: [],
        title: quoteTitle, // Add title to userImage
        userId: auth.currentUser
          ? auth.currentUser.uid
          : '',
      };
      dispatchUserData(userImageData);
      console.log('User Image Data: ', userImageData);

      // Add the new quote
      const docRef = await addDoc(
        collection(firestore, 'userImages'),
        userImageData
      );
      console.log('Document written with ID:', docRef.id);
      setDocumentId(docRef.id);
      sessionStorage.setItem('userImageId', docRef.id); // Store userImageId in sessionStorage
      console.log('auth.currentUser ', auth.currentUser);
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
        onNavigateScrollTopClick(
          `/defaultPreferences?userImageId=${docRef.id}`
        ); // Navigate to defaultPreferences with userImageId
        const nextUserImage = {
          id: docRef.id,
          title: quoteTitle,
        };
        dispatchUserImageList((prev) => [
          ...prev,
          nextUserImage,
        ]);
        onQuoteChange(nextUserImage.id);
        onNavigateScrollTopClick(
          `/defaultPreferences?userImageId=${docRef.id}`
        );
      } else {
        // Handle non-logged-in user case
        sessionStorage.setItem(
          'quoteData',
          JSON.stringify(userImageData)
        );
        onNavigateScrollTopClick(
          `/signup?userImageId=${docRef.id}`
        );
      }
    } catch (error) {
      const errorMessage =
        'Error creating user image document. Please try again.';
      notifyError(errorMessage);
      console.error(
        'Error creating user image document: ',
        error
      );
      dispatchErrorMessage(errorMessage);
    } finally {
      timeoutRef.current = setTimeout(() => {
        dispatchTitle('');
        setQuoteSubmitting(false);
      }, 0);
    }
  };

  return { isQuoteSubmitting, onSubmit: handler };
};
