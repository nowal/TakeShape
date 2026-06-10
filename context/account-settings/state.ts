'use client';

import { useState, useEffect, FormEvent } from 'react';
import { getAuth, onAuthStateChanged } from '@/lib/auth';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import firebase from '@/lib/firebase';
import { useAtom } from 'jotai';
import {
  isAgentAtom,
  isPainterAtom,
  isProfilePicAtom,
} from '@/atom';
import { resolveLogosUpload } from '@/utils/logos/upload';
import { notifyError } from '@/utils/notifications';
import { TAccountSettingsConfig } from '@/context/account-settings/types';
import { useApp } from '@/context/app/provider';
import {
  parseCoordsFromAddress,
  resolveAddressFromCoords,
  useAddressGeocodeHandler,
} from '@/hooks/address/geocode';
import { normalizeUsPhoneToE164 } from '@/utils/phone';

export const useAccountSettingsState = (
  config: TAccountSettingsConfig
) => {
  const { onNavigateScrollTopClick } = useApp();
  const {
    coords,
    range,
    address,
    addressFormatted,
    dispatchRange,
    dispatchAddressFormatted,
    onCoordsUpdate,
  } = config;
  const [isPainter, setPainter] = useAtom(isPainterAtom);
  const [isAgent, setAgent] = useAtom(isAgentAtom);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useAtom(
    isProfilePicAtom
  );
  const [newProfilePicture, setNewProfilePicture] =
    useState<File | null>(null);
  const [newProfilePicturePreview, setNewProfilePicturePreview] =
    useState<string | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [isInsured, setInsured] = useState(false);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(
    null
  );
  const [logoPreview, setLogoPreview] = useState<
    string | null
  >(null);
  const [termsAndConditionsFile, setTermsAndConditionsFile] =
    useState<File | null>(null);
  const [termsAndConditionsUrl, setTermsAndConditionsUrl] =
    useState<string | null>(null);
  const [termsAndConditionsFileName, setTermsAndConditionsFileName] =
    useState('');
  const [isAccountSettingsSubmitting, setAccountSettingsSubmitting] =
    useState(false);
  const [isDataLoading, setDataLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [agentName, setAgentName] = useState('');
  const [newAgentName, setNewAgentName] = useState('');
  const [agentError, setAgentError] = useState('');
  const [providerId, setProviderId] = useState('');
  const auth = getAuth(firebase);
  const storage = getStorage(firebase);
  const handleAddressGeocode = useAddressGeocodeHandler();
  const [resolvedUserId, setResolvedUserId] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          setDataLoading(false);
          setResolvedUserId('');
          setProviderId('');
          setPainter(false);
          setAgent(false);
          return;
        }

        if (resolvedUserId === user.uid) {
          return;
        }

        try {
          setResolvedUserId(user.uid);
          const providerResponse = await fetch(
            `/api/providers/by-user?userId=${encodeURIComponent(
              user.uid
            )}&_ts=${Date.now()}`,
            {
              cache: 'no-store',
              headers: {
                'cache-control': 'no-cache',
                pragma: 'no-cache',
              },
            }
          );
          const providerPayload = await providerResponse
            .json()
            .catch(() => ({}));
          const provider = providerPayload?.provider as
            | Record<string, unknown>
            | null;

          if (!provider?.id) {
            setProviderId('');
            setPainter(false);
            setAgent(false);
            setErrorMessage(
              'No provider profile found in Supabase for this account.'
            );
            return;
          }

          setProviderId(String(provider.id));
          setAgent(false);
          setPainter(true);
          setBusinessName(String(provider.business_name || ''));

          const rawPainterAddress = String(provider.address || '');
          const parsedCoordsAddress =
            parseCoordsFromAddress(rawPainterAddress);
          let displayPainterAddress = rawPainterAddress;
          if (parsedCoordsAddress) {
            const resolvedAddress =
              await resolveAddressFromCoords(
                parsedCoordsAddress
              );
            if (resolvedAddress) {
              displayPainterAddress = resolvedAddress;
            }
          }

          dispatchAddressFormatted(displayPainterAddress);
          dispatchRange(Number(provider.range_km || 0));
          setInsured(Boolean(provider.is_insured));
          setPhoneNumber(String(provider.phone_number || ''));
          setLogoUrl(String(provider.logo_url || '') || null);
          setTermsAndConditionsUrl(
            String(provider.terms_and_conditions_url || '') ||
              null
          );

          const providerCoords =
            (provider.coords as
              | { lat: number; lng: number }
              | undefined) ||
            parsedCoordsAddress ||
            (await handleAddressGeocode(displayPainterAddress));
          if (providerCoords) {
            onCoordsUpdate(providerCoords);
          }
          setErrorMessage('');
        } catch (error) {
          const message =
            'Failed to load provider data from Supabase.';
          console.error('Error fetching provider data:', error);
          setErrorMessage(message);
          notifyError(message);
        } finally {
          setDataLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, [auth, resolvedUserId]);

  const handleProfilePictureChange = (file: File) => {
    setNewProfilePicture(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewProfilePicturePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleLogoChange = (file: File) => {
    setLogo(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleTermsAndConditionsChange = (file: File) => {
    setTermsAndConditionsFile(file);
    setTermsAndConditionsFileName(file.name);
  };

  const uploadTermsAndConditionsAndGetUrl = async (
    file: File | null
  ): Promise<string> => {
    if (!file) return '';
    const termsRef = storageRef(
      storage,
      `terms-and-conditions/${file.name}-${Date.now()}`
    );
    await uploadBytes(termsRef, file);
    return await getDownloadURL(termsRef);
  };

  const handleUpdate = async () => {
    try {
      setAccountSettingsSubmitting(true);
      const currentUser = auth.currentUser;
      if (!currentUser) throw Error('No user');

      const addressValue = addressFormatted ?? address;
      if (!isPainter || !providerId) {
        setErrorMessage(
          'Only Supabase provider profiles are supported on this branch.'
        );
        return;
      }

      if (!addressValue) {
        setErrorMessage('Invalid address.');
        return;
      }

      const normalizedPhone = normalizeUsPhoneToE164(phoneNumber);
      if (!normalizedPhone) {
        setErrorMessage('Please enter a valid US phone number.');
        return;
      }

      const updatedLogoUrl = logo
        ? await resolveLogosUpload(logo)
        : logoUrl;
      const updatedTermsAndConditionsUrl =
        termsAndConditionsFile
          ? await uploadTermsAndConditionsAndGetUrl(
              termsAndConditionsFile
            )
          : termsAndConditionsUrl;

      const profileSyncResponse = await fetch(
        '/api/providers/sync-profile',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            providerId,
            userId: currentUser.uid,
            businessName,
            address: addressValue,
            isInsured,
            logoUrl: updatedLogoUrl || '',
            termsAndConditionsUrl:
              updatedTermsAndConditionsUrl || '',
            phoneNumber: normalizedPhone,
            coords,
            rangeKm: range,
          }),
        }
      );

      if (!profileSyncResponse.ok) {
        const payload = await profileSyncResponse
          .json()
          .catch(() => ({}));
        throw new Error(
          String(
            payload?.error ||
              'Failed to sync provider profile to Supabase'
          )
        );
      }

      setErrorMessage('');
      onNavigateScrollTopClick('/quotes');
    } catch (error) {
      console.error('Error updating provider info: ', error);
      setErrorMessage(
        'An unexpected error occurred. Please try again.'
      );
    } finally {
      setAccountSettingsSubmitting(false);
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    handleUpdate();
    event.preventDefault();
  };

  const profilePictureSrc =
    newProfilePicturePreview || profilePictureUrl;

  const logoSrc = logoPreview || logoUrl;
  const termsAndConditionsSrc = termsAndConditionsUrl;

  return {
    isAgent,
    isPainter,
    isAccountSettingsSubmitting,
    isDataLoading,
    profilePictureSrc,
    logoSrc,
    termsAndConditionsSrc,
    termsAndConditionsFileName:
      termsAndConditionsFileName ||
      (termsAndConditionsUrl
        ? decodeURIComponent(
            String(termsAndConditionsUrl)
              .split('?')[0]
              .split('/')
              .pop() || ''
          )
        : ''),
    name,
    errorMessage,
    businessName,
    range,
    phoneNumber,
    newAgentName,
    agentError,
    agentName,
    dispatchPhoneNumber: setPhoneNumber,
    dispatchName: setName,
    dispatchPainter: setPainter,
    dispatchAgentError: setAgentError,
    dispatchAgentName: setAgentName,
    dispatchBusinessName: setBusinessName,
    dispatchNewAgentName: setNewAgentName,
    dispatchProfilePictureUrl: setProfilePictureUrl,
    onSubmit: handleSubmit,
    onUpdate: handleUpdate,
    onLogoChange: handleLogoChange,
    onTermsAndConditionsChange:
      handleTermsAndConditionsChange,
    onProfilePictureChange: handleProfilePictureChange,
  };
};
