'use client';

import { errorAuth } from '@/utils/error/auth';
import {
  getAuth,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { ChangeEvent, FormEvent, useState } from 'react';
import {
  useRouter,
  useSearchParams,
} from 'next/navigation';
import {
  getFirestore,
  doc,
  deleteDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  getDoc,
} from 'firebase/firestore';
import { useAtom } from 'jotai';
import { isPainterAtom } from '@/atom';
import { TAuthConfig } from '@/context/auth/types';
import { useAccountSettings } from '@/context/account-settings/provider';
import { useApp } from '@/context/app/provider';

type TConfig = TAuthConfig;
export const useSignUp = (config: TConfig) => {
  const { onNavigateScrollTopClick } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { address, dispatchAddress } = useAccountSettings();
  const [addressComponents, setAddressComponents] =
    useState<any[]>([]);
  const [isSignUpSubmitting, setSignUpSubmitting] =
    useState(false);
  const [isPainter, setIsPainter] = useAtom(isPainterAtom);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isShowLoginInstead, setShowLoginInstead] =
    useState(false);
  const [errorMessage, setErrorMessage] = useState<
    null | string
  >('');
  const router = useRouter();
  const searchParams = useSearchParams();
  // const addressInputRef = useRef<HTMLInputElement>(null);

  const agentId = searchParams.get('agentId');
  const userImageId = searchParams.get('userImageId');

  const handleAddressChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const next = event.target.value;
    dispatchAddress(next);
    setErrorMessage(''); // Clear the error message when the user starts typing
  };

  const validateAddress = () => {
    return true; //need to work out how to set address components
    const requiredComponents = [
      'street_number',
      'route',
      'locality',
      'administrative_area_level_1',
      'postal_code',
    ];
    const foundComponents = requiredComponents.every(
      (component) =>
        addressComponents.some((ac) =>
          ac.types.includes(component)
        )
    );
    return foundComponents;
  };

  const handleSignUpSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const isAddressValid = validateAddress();
    if (!isAddressValid) {
      setErrorMessage('Please enter a valid address.');
      return;
    }
    setSignUpSubmitting(true); // Set loading state to true
    try {
      const auth = getAuth();
      const firestore = getFirestore();

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      const user = userCredential.user;

      // Create user document in "users" collection
      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, {
        email,
        address,
        name,
        phoneNumber,
        isPainter,
        reAgent: agentId || null,
        userImages: userImageId ? [userImageId] : [], // Initialize userImages array with userImageId if present
      });

      // Update the userImage document with the userId
      if (userImageId) {
        const userImageDocRef = doc(
          firestore,
          'userImages',
          userImageId
        );
        await updateDoc(userImageDocRef, {
          userId: user.uid,
        });

        // Add userImageId to the user's userImages array field
        await updateDoc(userDocRef, {
          userImages: arrayUnion(userImageId),
        });
      }

      const quoteData = sessionStorage.getItem('quoteData');

      if (quoteData) {
        const quote = JSON.parse(quoteData);
        if (userImageId) {
          const userImageDocRef = doc(
            firestore,
            'userImages',
            userImageId
          ); // Use userImageId from URL or session
          const userImageSnap = await getDoc(
            userImageDocRef
          );
          if (userImageSnap.exists()) {
            const existingData = userImageSnap.data();
            await updateDoc(userImageDocRef, {
              ...quote,
              address,
              ...(name && { name }),
              ...(phoneNumber && { phoneNumber }),
              userId: user.uid, // Ensure userId is set
              video: existingData.video, // Preserve existing video URL
            });
          }
        }
        sessionStorage.removeItem('quoteData');
      }

      if (
        isPainter &&
        sessionStorage.getItem('painterId')
      ) {
        const oldPainterId =
          sessionStorage.getItem('painterId');
        await handlePainterData(oldPainterId, user.uid);
      } else {
        setIsPainter(false);
      }

      if (userImageId) {
        onNavigateScrollTopClick(
          `/defaultPreferences?userImageId=${userImageId}`
        );
      } else {
        onNavigateScrollTopClick('/quote');
      }
    } catch (error) {
      const errorMessage = errorAuth(error);
      setErrorMessage(errorMessage);
      console.error(
        'Error signing up: ',
        errorMessage,
        error
      );
    } finally {
      setSignUpSubmitting(false); // Reset loading state
    }
  };

  const handlePainterData = async (
    oldPainterId: string | null,
    newUserId: string
  ) => {
    const firestore = getFirestore();
    if (oldPainterId) {
      const oldPainterDocRef = doc(
        firestore,
        'painters',
        oldPainterId
      );
      const oldPainterSnap = await getDoc(oldPainterDocRef);

      if (oldPainterSnap.exists()) {
        const oldPainterData = oldPainterSnap.data();
        const newPainterDocRef = doc(
          firestore,
          'painters',
          newUserId
        );
        await setDoc(newPainterDocRef, {
          ...oldPainterData,
          userId: newUserId,
        });

        await deleteDoc(oldPainterDocRef);

        setIsPainter(true);
        sessionStorage.removeItem('painterId');
      } else {
        console.error('Old painter document not found');
      }
    }
  };

  return {
    isShowLoginInstead,
    isSignUpSubmitting,
    isPainter,
    isPainterAtom,
    name,
    email,
    errorMessage,
    password,
    address,
    onSignUpSubmit: handleSignUpSubmit,
    onAddressChange: handleAddressChange,
    dispatchName: setName,
    dispatchEmail: setEmail,
    dispatchPassword: setPassword,
    dispatchAddress,
    dispatchShowLoginInstead: setShowLoginInstead,
  };
};
