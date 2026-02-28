'use client';

import { errorAuth } from '@/utils/error/auth';
import { notifyError } from '@/utils/notifications';
import { useState, FormEvent } from 'react';
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  updateDoc,
} from 'firebase/firestore';
import {
  getAuth,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import firebase from '@/lib/firebase';
import { useAtom } from 'jotai';
import { painterInfoAtom } from '@/atom';
import { useAccountSettings } from '@/context/account-settings/provider';
import { useApp } from '@/context/app/provider';
import { normalizeUsPhoneToE164 } from '@/utils/phone';

export const usePainterRegisterState = () => {
  const {
    address,
    addressFormatted,
    businessName,
    dispatchPainter,
    range,
    coords,
  } = useAccountSettings();
  const { onNavigateScrollTopClick } = useApp();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<
    string | null
  >(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [
    isPainterRegisterSubmitting,
    setPainterRegisterSubmitting,
  ] = useState(false);
  const [errorMessage, setErrorMessage] = useState<
    string | null
  >(null);
  const [painterInfo, setPainterInfo] =
    useAtom(painterInfoAtom);
  const storage = getStorage(firebase);
  const auth = getAuth(firebase);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setPainterRegisterSubmitting(true); // Set loading state to true
    setErrorMessage(''); // Reset error message

    try {
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
      const user = userCredential.user;

      const logoUrl = logo
        ? await uploadLogoAndGetUrl(logo)
        : ''; // Handle logo upload if provided
      const addressValue = addressFormatted ?? address;
      const normalizedPhone = normalizeUsPhoneToE164(
        phoneNumber
      );
      if (!normalizedPhone) {
        throw new Error(
          'Please enter a valid US phone number'
        );
      }

      const painterData = {
        businessName,
        address: addressValue,
        ...(coords ? { coords } : {}),
        range: 0,
        isInsured: false,
        logoUrl,
        phoneNumber: normalizedPhone,
        phoneNumberRaw: phoneNumber,
        signalwireCallerId: {
          status: 'pending',
          initiatedAt: new Date().toISOString(),
        },
        userId: user.uid, // Link the painter data to the user ID
        sessions: [], // Initialize empty sessions array for storing lead session IDs
      };

      const firestore = getFirestore();
      const painterDocRef = doc(
        collection(firestore, 'painters')
      );

      await setDoc(painterDocRef, painterData);
      console.log('Painter info saved:', painterData);

      try {
        const verifyResponse = await fetch(
          '/api/signalwire/verify-caller-id',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              phoneNumber: normalizedPhone,
              friendlyName: businessName,
            }),
          }
        );
        const verifyPayload = await verifyResponse
          .json()
          .catch(() => ({}));

        if (verifyResponse.ok) {
          await updateDoc(painterDocRef, {
            signalwireCallerId: {
              status:
                verifyPayload.status || 'pending',
              id: verifyPayload.id || null,
              callSid:
                verifyPayload.callSid || null,
              phoneNumber:
                verifyPayload.phoneNumber ||
                normalizedPhone,
              initiatedAt: new Date().toISOString(),
            },
          });
        } else {
          await updateDoc(painterDocRef, {
            signalwireCallerId: {
              status: 'verification_failed',
              phoneNumber: normalizedPhone,
              error:
                verifyPayload?.error ||
                'Failed to start caller ID verification',
              initiatedAt: new Date().toISOString(),
            },
          });
        }
      } catch (verificationError) {
        console.error(
          'Failed to auto-start caller ID verification:',
          verificationError
        );
      }

      dispatchPainter(true); // Set the user as a painter
      onNavigateScrollTopClick('/quotes');
    } catch (error) {
      console.error('Error registering painter: ', error);
      const errorMessage: null | string = errorAuth(error);
      notifyError(errorMessage);
      setErrorMessage(errorMessage);
    } finally {
      setPainterRegisterSubmitting(false); // Reset loading state
    }
  };

  const uploadLogoAndGetUrl = async (
    logoFile: File | null
  ) => {
    if (!logoFile) {
      return ''; // Return an empty string if no logo file is provided
    }

    const logoRef = storageRef(
      storage,
      `logos/${logoFile.name}-${Date.now()}`
    ); // Append timestamp to ensure unique file names

    try {
      const uploadResult = await uploadBytes(
        logoRef,
        logoFile
      );
      console.log('Upload result:', uploadResult);

      const logoUrl = await getDownloadURL(
        uploadResult.ref
      );
      console.log('Logo URL:', logoUrl);

      return logoUrl;
    } catch (error) {
      const errorMessage = 'Error uploading logo';
      notifyError(errorMessage);
      console.error('Error uploading logo: ', error);
    }
  };

  const handleLogoChange = (file: File) => {
    setLogo(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return {
    isPainterRegisterSubmitting,
    errorMessage,
    email,
    logoPreview,
    painterInfo,
    phoneNumber,
    password,
    dispatchPassword: setPassword,
    dispatchEmail: setEmail,
    dipatchPhoneNumber: setPhoneNumber,
    onLogoChange: handleLogoChange,
    onSubmit: handleSubmit,
  };
};
