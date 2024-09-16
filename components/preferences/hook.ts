'use client';
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
import { TValueChangeHandler } from '@/components/inputs/types';
import { PAINT_PREFERENCES_DEFAULTS } from '@/atom/constants';

export const useDefaultPreferences = () => {
  const firestore = getFirestore();
  const auth = getAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authInitialized, setAuthInitialized] =
    useState(false);
  const [defaultPreferences, setDefaultPreferences] =
    useAtom(defaultPreferencesAtom);
  const [isShowCeilingFields, setShowCeilingFields] =
    useState(defaultPreferences.ceilings || false);
  const [isShowTrimFields, setShowTrimFields] = useState(
    defaultPreferences.trim || false
  );
  const [isLaborAndMaterials, setLaborAndMaterial] =
    useState<boolean>(true);
  const [specialRequests, setSpecialRequests] =
    useState<string>('');
  const [isMoveFurniture, setMoveFurniture] =
    useState<boolean>(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isPopup, setShowPopup] = useState(false);

  const userImageId =
    searchParams.get('userImageId') ||
    sessionStorage.getItem('userImageId');

  useEffect(() => {
    setDefaultPreferences({
      ...PAINT_PREFERENCES_DEFAULTS,
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
        userImageDocData.isLaborAndMaterials ?? true
      ); // Default to labor and material if field is missing
      setSpecialRequests(
        userImageDocData.specialRequests || ''
      ); // Load special requests if available
      setMoveFurniture(
        userImageDocData.isMoveFurniture ?? false
      ); // Load isMoveFurniture if available
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
            laborAndMaterial: isLaborAndMaterials,
            ...PAINT_PREFERENCES_DEFAULTS,
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
        laborAndMaterial: isLaborAndMaterials,
        ...PAINT_PREFERENCES_DEFAULTS,
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
      laborAndMaterial: isLaborAndMaterials, // Add isLaborAndMaterials field
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
      ceilings: isShowCeilingFields,
      trim: isShowTrimFields,
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
      laborAndMaterial: isLaborAndMaterials, // Update laborAndMaterial field
      specialRequests, // Save special requests
      moveFurniture: isMoveFurniture, // Save moveFurniture
    });

    // Pass userImageId to the dashboard
    router.push(`${navigateTo}?userImageId=${userImageId}`);
    setIsLoading(false); // Reset loading state
  };

  const handleValueChange: TValueChangeHandler = (
    name,
    value
  ) => {
    setDefaultPreferences((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChange = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const target = event.target as HTMLInputElement;
    const value: string | boolean =
      target.type === 'checkbox'
        ? target.checked
        : target.value;
    const name = target.name;

    handleValueChange(name, value);

    console.log(name, value, target.type);

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
      defaultPreferences.ceilings ?? isShowCeilingFields
    );
    setShowTrimFields(
      defaultPreferences.trim ?? isShowTrimFields
    );
  };

  const isTrimAndDoorsPainted =
    defaultPreferences.trim || false;
  const isCeilingsPainted =
    defaultPreferences.ceilings || false;

  return {
    isPopup,
    isCeilingsPainted,
    isLoading,
    isTrimAndDoorsPainted,
    onValueChange: handleValueChange,
    onLaborMaterialChange: handleLaborMaterialChange,
    onChange: handleChange,
    onPreferenceSubmit: handlePreferenceSubmit,
    specialRequests,
    onSpecialRequests: setSpecialRequests,
    isMoveFurniture: Boolean(isMoveFurniture),
    onMoveFurniture: setMoveFurniture,
    isLaborAndMaterials: isLaborAndMaterials === true,
    onLaborAndMaterial: setLaborAndMaterial,
    isShowCeilingFields,
    isShowTrimFields,
    ...defaultPreferences,
  };
};
