import {
  Dispatch,
  FormEventHandler,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
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
import { TPaintPreferences } from '@/types';
import { title } from 'process';
import { useAuth } from '@/context/auth/provider';

type TConfig = {
  title: string;
  zipCode: string;
  paintPreferences: TPaintPreferences;
  dispatchErrorMessage: Dispatch<string>;
};
export const useQuoteSubmit = ({
  zipCode,
  paintPreferences,
  dispatchErrorMessage,
}: TConfig) => {
  const { isUserSignedIn } = useAuth();
  const [description, setDescription] = useState('');
  const [providingOwnPaint, setProvidingOwnPaint] =
    useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const auth = getAuth();
  const router = useRouter();
  const firestore = getFirestore(firebase);

  const [, setDocumentId] = useAtom(documentIdAtom);
  const handler: FormEventHandler = async (event) => {
    event.preventDefault();
    console.log('Creating user image document');
    setSubmitting(true);
    dispatchErrorMessage('');

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
      dispatchErrorMessage(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return { onSubmit: handler, isSubmitting };
};
