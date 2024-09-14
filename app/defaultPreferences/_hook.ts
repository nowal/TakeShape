'use client';;
import React, { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import {
  useRouter,
  useSearchParams,
} from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { defaultPreferencesAtom } from '../../atom/atom';

export const useDefaultPreferences = () => {
  const firestore = getFirestore();
  const auth = getAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authInitialized, setAuthInitialized] =
    useState(false);
  const [defaultPreferences, setDefaultPreferences] =
    useAtom(defaultPreferencesAtom);
  const [showCeilingFields, setShowCeilingFields] =
    useState(defaultPreferences.ceilings || false);
  const [showTrimFields, setShowTrimFields] = useState(
    defaultPreferences.trim || false
  );
  const [laborAndMaterial, setLaborAndMaterial] =
    useState<boolean>(true);
  const [specialRequests, setSpecialRequests] =
    useState<string>('');
  const [moveFurniture, setMoveFurniture] =
    useState<boolean>(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isPopup, setShowPopup] = useState(false);

  const userImageId =
    searchParams.get('userImageId') ||
    sessionStorage.getItem('userImageId');

  useEffect(() => {
    setDefaultPreferences({
      color: '',
      finish: 'Eggshell',
      paintQuality: 'Medium',
      ceilingColor: 'White',
      ceilingFinish: 'Flat',
      trimColor: 'White',
      trimFinish: 'Semi-gloss',
      ...defaultPreferences,
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthInitialized(true);
      } else {
        setAuthInitialized(false);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (authInitialized && auth.currentUser) {
      fetchUserDefaultPreferences();
    }
  }, [authInitialized, auth.currentUser, firestore]);

  const fetchUserDefaultPreferences = async () => {
    if (!auth.currentUser || !userImageId) return;

    const userImageDocRef = doc(
      firestore,
      'userImages',
      userImageId
    );
    const userImageDoc = await getDoc(userImageDocRef);
    if (userImageDoc.exists()) {
      const userImageDocData = userImageDoc.data();
      setLaborAndMaterial(
        userImageDocData.laborAndMaterial ?? true
      ); // Default to labor and material if field is missing
      setSpecialRequests(
        userImageDocData.specialRequests || ''
      ); // Load special requests if available
      setMoveFurniture(
        userImageDocData.moveFurniture ?? false
      ); // Load moveFurniture if available
      if (userImageDocData.paintPreferencesId) {
        const paintPrefDocRef = doc(
          firestore,
          'paintPreferences',
          userImageDocData.paintPreferencesId
        );
        const paintPrefDocSnap = await getDoc(
          paintPrefDocRef
        );
        if (paintPrefDocSnap.exists()) {
          setDefaultPreferences({
            color: '',
            finish: 'Eggshell',
            paintQuality: 'Medium',
            ceilingColor: 'White',
            ceilingFinish: 'Flat',
            trimColor: 'White',
            trimFinish: 'Semi-gloss',
            laborAndMaterial: laborAndMaterial,
            ...paintPrefDocSnap.data(),
          });
          setShowCeilingFields(
            paintPrefDocSnap.data().ceilings || false
          );
          setShowTrimFields(
            paintPrefDocSnap.data().trim || false
          );
          setShowPopup(true); // Show the popup if paint preferences exist
        }
      }
    } else {
      setLaborAndMaterial(true); // Default to labor and material if no document found
      setDefaultPreferences({
        color: '',
        finish: 'Eggshell',
        paintQuality: 'Medium',
        ceilingColor: 'White',
        ceilingFinish: 'Flat',
        trimColor: 'White',
        trimFinish: 'Semi-gloss',
        laborAndMaterial: laborAndMaterial,
      });
    }
  };

  const handlePreferenceSubmit = async (
    navigateTo: string,
    morePreferences: boolean
  ) => {
    if (!auth.currentUser || !userImageId) return;
    setIsLoading(true); // Set loading state to true

    const userImageDocRef = doc(
      firestore,
      'userImages',
      userImageId
    );
    const paintPrefDocRef = doc(
      firestore,
      'paintPreferences',
      `${userImageId}-${auth.currentUser.uid}`
    );

    // Build the updatedPreferences object conditionally
    const updatedPreferences = {
      laborAndMaterial: laborAndMaterial, // Add laborAndMaterial field
      color:
        (
          document.getElementsByName(
            'color'
          )[0] as HTMLInputElement
        )?.value || defaultPreferences.color,
      finish:
        (
          document.getElementsByName(
            'finish'
          )[0] as HTMLSelectElement
        )?.value || defaultPreferences.finish,
      paintQuality:
        (
          document.getElementsByName(
            'paintQuality'
          )[0] as HTMLSelectElement
        )?.value || defaultPreferences.paintQuality,
      ceilings: showCeilingFields,
      trim: showTrimFields,
      ceilingColor:
        (
          document.getElementsByName(
            'ceilingColor'
          )[0] as HTMLInputElement
        )?.value || defaultPreferences.ceilingColor,
      ceilingFinish:
        (
          document.getElementsByName(
            'ceilingFinish'
          )[0] as HTMLSelectElement
        )?.value || defaultPreferences.ceilingFinish,
      trimColor:
        (
          document.getElementsByName(
            'trimColor'
          )[0] as HTMLInputElement
        )?.value || defaultPreferences.trimColor,
      trimFinish:
        (
          document.getElementsByName(
            'trimFinish'
          )[0] as HTMLSelectElement
        )?.value || defaultPreferences.trimFinish,
    };

    setDefaultPreferences(updatedPreferences);

    await setDoc(paintPrefDocRef, updatedPreferences, {
      merge: true,
    });

    await updateDoc(userImageDocRef, {
      paintPreferencesId: paintPrefDocRef.id,
      morePreferences,
      laborAndMaterial, // Update laborAndMaterial field
      specialRequests, // Save special requests
      moveFurniture, // Save moveFurniture
    });

    // Pass userImageId to the dashboard
    router.push(`${navigateTo}?userImageId=${userImageId}`);
    setIsLoading(false); // Reset loading state
  };

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const value: string | boolean =
      target.type === 'checkbox'
        ? target.checked
        : target.value;
    const name = target.name;

    setDefaultPreferences((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (target.type === 'checkbox') {
      if (name === 'ceilings') {
        setShowCeilingFields(target.checked);
      } else if (name === 'trim') {
        setShowTrimFields(target.checked);
      }
    }
  };

  const handleLaborMaterialChange = (value: boolean) => {
    setLaborAndMaterial(value);
    setShowCeilingFields(
      defaultPreferences.ceilings ?? showCeilingFields
    );
    setShowTrimFields(
      defaultPreferences.trim ?? showTrimFields
    );
  };

  const isLaborAndMaterials = laborAndMaterial === true;

  const isTrimAndDoorsPainted =
    defaultPreferences.trim || false;
  const isCeilingsPainted =
    defaultPreferences.ceilings || false;
  const isMoveFurniture = Boolean(moveFurniture);

  return {
    laborAndMaterial,
    isPopup,
    isCeilingsPainted,
    isLaborAndMaterials,
    isLoading,
    isMoveFurniture,
    isTrimAndDoorsPainted,
    handleLaborMaterialChange,
    handleChange,
    handlePreferenceSubmit,
    specialRequests,
    setSpecialRequests
    
  };
};
