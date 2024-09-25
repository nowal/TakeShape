'use client';
import { useState, useEffect, useRef } from 'react';
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
import firebase from '../../lib/firebase';
import { useAtom } from 'jotai';
import { isPainterAtom } from '../../atom';
import { loadGoogleMapsScript } from '../../utils/loadGoogleMapsScript'; // Adjust the import path as needed
import { TAccountSettingsStateConfig } from '@/context/account-settings/types';

export const useAccountSettingsState = (
  config: TAccountSettingsStateConfig
) => {
  const {
    address,
    dispatchAddress,
    onInitializeMap,
    addressInputRef,
  } = config;
  const [isPainter, setPainter] = useAtom(isPainterAtom);
  // const [painterInfo, setPainterInfo] = useAtom(painterInfoAtom);
  const [isAgent, setAgent] = useState(false); // New state for isAgent
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] =
    useState<string | null>(null);
  const [newProfilePicture, setNewProfilePicture] =
    useState<File | null>(null);
  const [
    newProfilePicturePreview,
    setNewProfilePicturePreview,
  ] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [range, setRange] = useState(10);
  const [isInsured, setInsured] = useState(false);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(
    null
  );
  const [logoPreview, setLogoPreview] = useState<
    string | null
  >(null);
  const [isLoading, setLoading] = useState(false);
  const [isDataLoading, setDataLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [agentName, setAgentName] = useState(''); // New state for agent's name
  const [newAgentName, setNewAgentName] = useState(''); // New state for new agent's name
  const [agentError, setAgentError] = useState(''); // New state for agent error message
  const auth = getAuth(firebase);
  const firestore = getFirestore();
  const storage = getStorage(firebase);

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
            if (agentDoc.exists()) {
              setAgent(true);
              setPainter(false);
              const agentData = agentDoc.data();
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
              if (!painterSnapshot.empty) {
                setPainter(true);
                setAgent(false);
                const painterData =
                  painterSnapshot.docs[0].data();
                setBusinessName(
                  painterData.businessName || ''
                );
                dispatchAddress(painterData.address || '');
                setRange(painterData.range || 10);
                setInsured(painterData.isInsured || false);
                setPhoneNumber(
                  painterData.phoneNumber || ''
                );
                setLogoUrl(painterData.logoUrl || null);
                // Geocode address to set marker
                geocodeAddress(painterData.address);
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
                  geocodeAddress(userData.address);
                } else {
                  setErrorMessage('User data not found.');
                }
              }
            }
          } catch (error) {
            console.error(
              'Error fetching user data:',
              error
            );
            setErrorMessage(
              'Failed to load user data. Please try again later.'
            );
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

  useEffect(() => {
    const initAutocomplete = async () => {
      try {
        await loadGoogleMapsScript(
          'AIzaSyCtM9oQWFui3v5wWI8A463_AN1QN0ITWAA'
        ); // Replace with your actual API key
        if (window.google) {
          const autocomplete =
            new window.google.maps.places.Autocomplete(
              addressInputRef.current!,
              {
                types: ['address'],
                componentRestrictions: { country: 'us' },
              }
            );

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (
              !place.geometry ||
              !place.geometry.location ||
              !place.address_components
            ) {
              console.error(
                'Error: place details are incomplete.'
              );
              return;
            }

            dispatchAddress(place.formatted_address ?? ''); // Add a fallback value
            geocodeAddress(place.formatted_address ?? '');
          });
        }
      } catch (error) {
        console.error(
          'Error loading Google Maps script:',
          error
        );
      }
    };

    initAutocomplete();
  }, []);

  const geocodeAddress = (address: string) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (
        status === 'OK' &&
        results &&
        results[0].geometry.location
      ) {
        const location = results[0].geometry.location;
        onInitializeMap(
          location.lat(),
          location.lng(),
          range
        );
      } else {
        console.error(
          'Geocode was not successful for the following reason: ' +
            status
        );
      }
    });
  };

  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProfilePicturePreview(
          reader.result as string
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setLoading(true); // Set loading state to true
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      if (isPainter) {
        // Painter specific update
        const painterQuery = query(
          collection(firestore, 'painters'),
          where('userId', '==', currentUser.uid)
        );
        const painterSnapshot = await getDocs(painterQuery);

        if (!painterSnapshot.empty) {
          const painterDocRef = painterSnapshot.docs[0].ref;
          const updatedLogoUrl = logo
            ? await uploadLogoAndGetUrl(logo)
            : logoUrl; // Handle logo upload if provided

          const updatedPainterData = {
            businessName,
            address,
            range,
            isInsured,
            logoUrl: updatedLogoUrl,
            phoneNumber,
          };

          await updateDoc(
            painterDocRef,
            updatedPainterData
          );
          console.log(
            'Painter info updated:',
            updatedPainterData
          );

          window.location.reload(); // Reload the page after updating
        } else {
          setErrorMessage('Painter data not found.');
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
              address,
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
          } else {
            setErrorMessage('User data not found.');
          }
        }
      }
    } catch (error) {
      console.error('Error updating user info: ', error);
      setErrorMessage(
        'An unexpected error occurred. Please try again.'
      );
    } finally {
      setLoading(false); // Reset loading state
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
      console.error('Error uploading logo: ', error);
      throw new Error('Error uploading logo.');
    }
  };

  const profilePicSrc =
    newProfilePicturePreview || profilePictureUrl;

  const logoSrc = logoPreview || logoUrl;

  return {
    isLoading,
    isDataLoading,
    profilePicSrc,
    logoSrc,
    name,
    errorMessage,
    businessName,
    range,
    phoneNumber,
    newAgentName,
    agentError,
    agentName,
    dispatchRange: setRange,
    dispatchPhoneNumber: setPhoneNumber,
    dispatchName: setName,
    dispatchAgentError: setAgentError,
    dispatchAgentName: setAgentName,
    dispatchBusinessName: setBusinessName,
    dispatchNewAgentName: setNewAgentName,
    onSubmit: handleSubmit,
    onLogoChange: handleLogoChange,
    onProfilePictureChange: handleProfilePictureChange,
  };
};
