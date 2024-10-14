'use client';

import { errorAuth } from '@/utils/error/auth';
import { notifyError } from '@/utils/notifications';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  getFirestore,
  doc,
  setDoc,
  collection,
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
import { useAutoFillAddress } from '@/hooks/auto-fill/address';
import { useAccountSettings } from '@/context/account-settings/provider';
import { useAuth } from '@/context/auth/provider';
import { useApp } from '@/context/app/provider';

export const usePainterRegisterState = () => {
  const {
    address,
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
  const router = useRouter();
  const auth = getAuth(firebase);

  useAutoFillAddress();

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

      const painterData = {
        businessName,
        address,
        ...(coords ? { coords } : {}),
        range,
        isInsured: false,
        logoUrl,
        phoneNumber,
        userId: user.uid, // Link the painter data to the user ID
      };

      const firestore = getFirestore();
      const painterDocRef = doc(
        collection(firestore, 'painters')
      );

      await setDoc(painterDocRef, painterData);
      console.log('Painter info saved:', painterData);
      dispatchPainter(true); // Set the user as a painter
      onNavigateScrollTopClick('/dashboard');
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
