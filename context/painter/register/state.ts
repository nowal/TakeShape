'use client';

import { errorAuth } from '@/utils/error/auth';
import { notifyError } from '@/utils/notifications';
import { useState, FormEvent } from 'react';
import {
  getAuth,
  createUserWithEmailAndPassword,
} from '@/lib/auth';
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
import { getCommunicationDashboardPath } from '@/lib/provider-dashboard/links';
import { takeshapeAppSupabaseBrowser } from '@/lib/supabase/takeshape-app-browser';
import { useSearchParams } from 'next/navigation';

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
  const searchParams = useSearchParams();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<
    string | null
  >(null);
  const [termsAndConditionsFile, setTermsAndConditionsFile] =
    useState<File | null>(null);
  const [
    termsAndConditionsFileName,
    setTermsAndConditionsFileName,
  ] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [
    isPainterRegisterSubmitting,
    setPainterRegisterSubmitting,
  ] = useState(false);
  const [errorMessage, setErrorMessage] = useState<
    string | null
  >(null);
  const [painterInfo] = useAtom(painterInfoAtom);
  const storage = getStorage(firebase);
  const auth = getAuth(firebase);
  const requestedProviderId =
    searchParams.get('provider') || searchParams.get('providerId');

  const getCurrentAccessToken = async () => {
    const { data, error } =
      await takeshapeAppSupabaseBrowser.auth.getSession();
    if (error) throw error;
    return data.session?.access_token || '';
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setPainterRegisterSubmitting(true); // Set loading state to true
    setErrorMessage(''); // Reset error message

    try {
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const logoUrl = logo
        ? await uploadLogoAndGetUrl(logo)
        : ''; // Handle logo upload if provided
      const termsAndConditionsUrl = termsAndConditionsFile
        ? await uploadTermsAndConditionsAndGetUrl(
            termsAndConditionsFile
          )
        : '';
      const addressValue = addressFormatted ?? address;
      const normalizedPhone = normalizeUsPhoneToE164(
        phoneNumber
      );
      if (!normalizedPhone) {
        throw new Error(
          'Please enter a valid US phone number'
        );
      }

      const accessToken = await getCurrentAccessToken();
      if (!accessToken) {
        throw new Error(
          'Check your email to confirm the account, then log in to open your dashboard.'
        );
      }

      const profileSyncResponse = await fetch(
        '/api/provider-auth/complete',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address: addressValue,
            businessName,
            coords,
            fullName: businessName,
            logoUrl,
            phoneNumber: normalizedPhone,
            phone: normalizedPhone,
            providerId: requestedProviderId,
            serviceRadiusMiles: range,
            termsAndConditionsUrl,
          }),
        }
      );
      const payload = (await profileSyncResponse
        .json()
        .catch(() => ({}))) as {
        dashboardPath?: string;
        error?: string;
        ok?: boolean;
        providerId?: string;
      };

      if (
        !profileSyncResponse.ok ||
        !payload.ok ||
        !payload.providerId
      ) {
        throw new Error(
          String(
            payload?.error ||
              'Failed to sync provider profile to Supabase.'
          )
        );
      }

      dispatchPainter(true); // Set the user as a painter
      onNavigateScrollTopClick(
        payload.dashboardPath ||
          getCommunicationDashboardPath(payload.providerId)
      );
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
  ): Promise<string> => {
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
      return '';
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

  const uploadTermsAndConditionsAndGetUrl = async (
    file: File | null
  ): Promise<string> => {
    if (!file) return '';
    const fileRef = storageRef(
      storage,
      `terms-and-conditions/${file.name}-${Date.now()}`
    );
    try {
      const uploadResult = await uploadBytes(fileRef, file);
      return await getDownloadURL(uploadResult.ref);
    } catch (error) {
      const errorMessage =
        'Error uploading terms and conditions PDF';
      notifyError(errorMessage);
      console.error(errorMessage, error);
      return '';
    }
  };

  const handleTermsAndConditionsChange = (file: File) => {
    setTermsAndConditionsFile(file);
    setTermsAndConditionsFileName(file.name);
  };

  return {
    isPainterRegisterSubmitting,
    errorMessage,
    email,
    logoPreview,
    termsAndConditionsFileName,
    painterInfo,
    phoneNumber,
    password,
    dispatchPassword: setPassword,
    dispatchEmail: setEmail,
    dipatchPhoneNumber: setPhoneNumber,
    onLogoChange: handleLogoChange,
    onTermsAndConditionsChange:
      handleTermsAndConditionsChange,
    onSubmit: handleSubmit,
  };
};
