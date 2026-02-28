'use client';
import { useState, useEffect, FormEvent } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
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
    range,
    address,
    addressFormatted,
    dispatchRange,
    dispatchAddress,
    dispatchAddressFormatted,
    onCoordsUpdate,
  } = config;
  const [isPainter, setPainter] = useAtom(isPainterAtom);
  const [isAgent, setAgent] = useAtom(isAgentAtom); // New state for isAgent
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useAtom(
    isProfilePicAtom
  );
  const [newProfilePicture, setNewProfilePicture] =
    useState<File | null>(null);
  const [
    newProfilePicturePreview,
    setNewProfilePicturePreview,
  ] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [isInsured, setInsured] = useState(false);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(
    null
  );
  const [logoPreview, setLogoPreview] = useState<
    string | null
  >(null);
  const [
    isAccountSettingsSubmitting,
    setAccountSettingsSubmitting,
  ] = useState(false);
  const [isDataLoading, setDataLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [agentName, setAgentName] = useState(''); // New state for agent's name
  const [newAgentName, setNewAgentName] = useState(''); // New state for new agent's name
  const [agentError, setAgentError] = useState(''); // New state for agent error message
  const auth = getAuth(firebase);
  const firestore = getFirestore();
  const storage = getStorage(firebase);
  const handleAddressGeocode = useAddressGeocodeHandler();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
          try {
            // Check if the user is an agent
            const agentDocRef = doc(
              firestore,
              'reAgents',
              user.uid
            );
            const agentDoc = await getDoc(agentDocRef);
            const isAgent = agentDoc.exists();
            setAgent(isAgent);
            if (isAgent) {
              setPainter(false);
              const agentData = agentDoc.data();
              console.log(agentData);
              setName(agentData.name || '');
              setPhoneNumber(agentData.phoneNumber || '');
              setProfilePictureUrl(
                agentData.profilePictureUrl || null
              );
            } else {
              // Check if the user is a painter
              const painterQuery = query(
                collection(firestore, 'painters'),
                where('userId', '==', user.uid)
              );
              const painterSnapshot = await getDocs(
                painterQuery
              );
              const isPainter = !painterSnapshot.empty;
              setPainter(isPainter);

              if (isPainter) {
                setAgent(false);
                const painterData =
                  painterSnapshot.docs[0].data();
                setProfilePictureUrl(
                  painterData.profilePictureUrl || null
                );
                setBusinessName(
                  painterData.businessName || ''
                );
                const rawPainterAddress = String(
                  painterData.address || ''
                );
                const parsedCoordsAddress =
                  parseCoordsFromAddress(
                    rawPainterAddress
                  );
                let displayPainterAddress =
                  rawPainterAddress;
                if (parsedCoordsAddress) {
                  const resolvedAddress =
                    await resolveAddressFromCoords(
                      parsedCoordsAddress
                    );
                  if (resolvedAddress) {
                    displayPainterAddress =
                      resolvedAddress;
                  }
                }
                dispatchAddressFormatted(
                  displayPainterAddress
                );
                dispatchRange(painterData.range ?? 0);
                setInsured(painterData.isInsured || false);
                setPhoneNumber(
                  painterData.phoneNumberRaw ||
                    painterData.phoneNumber ||
                    ''
                );
                setLogoUrl(painterData.logoUrl || null);
                // Geocode address to set marker
                const address =
                  displayPainterAddress;
                const nextCoords =
                  (painterData.coords as
                    | { lat: number; lng: number }
                    | undefined) ??
                  parsedCoordsAddress ??
                  (await handleAddressGeocode(address));
                if (nextCoords) {
                  onCoordsUpdate(nextCoords);
                }
                console.log('painterData: ', painterData);
              } else {
                // User is a homeowner
                setPainter(false);
                setAgent(false);
                const userQuery = query(
                  collection(firestore, 'users'),
                  where('email', '==', user.email)
                );
                const userSnapshot = await getDocs(
                  userQuery
                );
                if (!userSnapshot.empty) {
                  const userData =
                    userSnapshot.docs[0].data();
                  setName(userData.name || '');
                  setPhoneNumber(
                    userData.phoneNumber || ''
                  );
                  dispatchAddress(userData.address || '');
                  // Check if user has an associated agent
                  if (userData.reAgent) {
                    const agentDoc = await getDoc(
                      doc(
                        firestore,
                        'reAgents',
                        userData.reAgent
                      )
                    );
                    if (agentDoc.exists()) {
                      setAgentName(
                        agentDoc.data().name || ''
                      );
                    }
                  }
                  // Geocode address to set marker
                  // onGeocodeAddress(userData.address);
                  console.log('userData: ', userData);

                  const nextCoords =
                    await handleAddressGeocode(
                      userData.address
                    );
                  if (nextCoords) {
                    onCoordsUpdate(nextCoords);
                  }
                } else {
                  setErrorMessage('User data not found.');
                  return;
                }
              }
            }
            setErrorMessage('');
          } catch (error) {
            const errorMessage =
              'Failed to load user data. Please try again later.';
            console.error(
              'Error fetching user data:',
              error
            );
            setErrorMessage(errorMessage);
            notifyError(errorMessage);
          } finally {
            setDataLoading(false); // Stop loading
          }
        } else {
          setDataLoading(false); // Stop loading if no user is authenticated
        }
      }
    );

    return () => unsubscribe();
  }, [auth, firestore]);

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

  const handleUpdate = async () => {
    try {
      setAccountSettingsSubmitting(true); // Set loading state to true
      const currentUser = auth.currentUser;
      if (!currentUser) throw Error('No user');

      const addressValue = addressFormatted ?? address;

      if (isPainter) {
        // Painter specific update
        const painterQuery = query(
          collection(firestore, 'painters'),
          where('userId', '==', currentUser.uid)
        );
        const painterSnapshot = await getDocs(painterQuery);
        const isPainter = !painterSnapshot.empty;

        if (!addressValue) {
          setErrorMessage('Invalid address.');
          return;
        }

        if (isPainter) {
          const painterDocRef = painterSnapshot.docs[0].ref;
          const currentPainterData =
            painterSnapshot.docs[0].data();
          const normalizedPhone =
            normalizeUsPhoneToE164(phoneNumber);
          if (!normalizedPhone) {
            setErrorMessage(
              'Please enter a valid US phone number.'
            );
            return;
          }
          const currentNormalizedPhone =
            normalizeUsPhoneToE164(
              String(
                currentPainterData.phoneNumber ||
                  currentPainterData.phoneNumberRaw ||
                  ''
              )
            );
          const phoneChanged =
            normalizedPhone !== currentNormalizedPhone;
          const updatedLogoUrl = logo
            ? await resolveLogosUpload(logo)
            : logoUrl; // Handle logo upload if provided

          const updatedPainterData = {
            businessName,
            address: addressValue,
            range: 0,
            isInsured,
            logoUrl: updatedLogoUrl,
            phoneNumber: normalizedPhone,
            phoneNumberRaw: phoneNumber,
            ...(phoneChanged
              ? {
                  signalwireCallerId: {
                    status: 'unverified',
                    phoneNumber: normalizedPhone,
                    alreadyVerified: false,
                    initiatedAt: null,
                    id: null,
                    callSid: null,
                    error: null,
                  },
                }
              : {}),
          };

          await updateDoc(
            painterDocRef,
            updatedPainterData
          );
          console.log(
            'Painter info updated:',
            updatedPainterData
          );
          console.log('DONE - redirect');

          onNavigateScrollTopClick(
            phoneChanged ? '/call' : '/quotes'
          );
        } else {
          setErrorMessage('Painter data not found.');
          return;
        }
      } else {
        // Agent or Homeowner specific update
        let profilePictureUrlToUpdate = profilePictureUrl;

        // Upload new profile picture if provided
        if (newProfilePicture) {
          const profilePictureRef = storageRef(
            storage,
            `profilePictures/${currentUser.uid}`
          );
          await uploadBytes(
            profilePictureRef,
            newProfilePicture
          );
          profilePictureUrlToUpdate = await getDownloadURL(
            profilePictureRef
          );
        }

        if (isAgent) {
          // Update user document in "reAgents" collection
          const userDocRef = doc(
            firestore,
            'reAgents',
            currentUser.uid
          );
          await updateDoc(userDocRef, {
            name,
            phoneNumber,
            profilePictureUrl: profilePictureUrlToUpdate,
          });

          onNavigateScrollTopClick('/agentDashboard');
        } else {
          // Homeowner update
          const userQuery = query(
            collection(firestore, 'users'),
            where('email', '==', currentUser.email)
          );
          const userSnapshot = await getDocs(userQuery);

          if (!userSnapshot.empty) {
            const userDocRef = userSnapshot.docs[0].ref;
            await updateDoc(userDocRef, {
              name,
              phoneNumber,
              address: addressValue,
            });

            // Handle Real Estate Agent update
            if (newAgentName) {
              console.log(newAgentName);
              const agentQueryAll = query(
                collection(firestore, 'reAgents')
                // where('name', '==', newAgentName)
              );
              const agentQuery = query(
                collection(firestore, 'reAgents'),
                where('name', '==', newAgentName)
              );
              console.log(agentQueryAll, agentQuery);
              const agentSnapshotAll = await getDocs(
                agentQueryAll
              );
              const agentSnapshot = await getDocs(
                agentQuery
              );
              console.log(agentSnapshotAll, agentSnapshot);

              if (!agentSnapshot.empty) {
                const agentDoc = agentSnapshot.docs[0];
                await updateDoc(userDocRef, {
                  reAgent: agentDoc.id,
                });
                setAgentName(agentDoc.data().name || '');
                setAgentError('');
              } else {
                setAgentError('Agent not found');
              }
            }
            onNavigateScrollTopClick('/dashboard');
          } else {
            setErrorMessage('User data not found.');
            return;
          }
        }
      }
      setErrorMessage('');
    } catch (error) {
      console.error('Error updating user info: ', error);
      setErrorMessage(
        'An unexpected error occurred. Please try again.'
      );
    } finally {
      setAccountSettingsSubmitting(false); // Reset loading state
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

  return {
    isAgent,
    isPainter,
    isAccountSettingsSubmitting,
    isDataLoading,
    profilePictureSrc,
    logoSrc,
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
    onProfilePictureChange: handleProfilePictureChange,
  };
};
