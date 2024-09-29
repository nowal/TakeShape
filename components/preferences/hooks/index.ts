'use client';
import { ChangeEvent, useEffect, useState } from 'react';
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
import { defaultPreferencesAtom } from '../../../atom';
import { TValueChangeHandler } from '@/components/inputs/types';
import {
  PAINT_PREFERENCES_DEFAULTS,
  PREFERENCES_NAME_BOOLEAN_CEILINGS,
  PREFERENCES_NAME_BOOLEAN_TRIM,
} from '@/atom/constants';
import { RADIO_VALUE_YES } from '@/components/preferences/row/yes-no';
import { usePreferencesAddress } from '@/components/preferences/hooks/address';

export const usePreferences = () => {
  const firestore = getFirestore();
  const auth = getAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authInitialized, setAuthInitialized] =
    useState(false);
  const [defaultPreferences, setPreferences] = useAtom(
    defaultPreferencesAtom
  );
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

  const loadingState = useState<boolean>(false);
  const [isPopup, setShowPopup] = useState(false);

  const userImageId =
    searchParams.get('userImageId') ||
    sessionStorage.getItem('userImageId');

  usePreferencesAddress({
    loadingState,
    firestore,
    userImageId,
    currentUser: auth.currentUser,
  });

  const [isLoading, setLoading] = loadingState;

  useEffect(() => {
    setPreferences({
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
      fetchUserPreferences();
    }
  }, [authInitialized, auth.currentUser, firestore]);

  const fetchUserPreferences = async () => {
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
          setPreferences({
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
      setPreferences({
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
    setLoading(true); // Set loading state to true

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

    setPreferences(updatedPreferences);

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
    setLoading(false); // Reset loading state
  };

  const handleValueChange: TValueChangeHandler = (
    name,
    value
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChange = (
    event:
      | ChangeEvent<HTMLInputElement>
      | ChangeEvent<HTMLSelectElement>
  ) => {
    const target = event.currentTarget as HTMLInputElement;
    let value: string | boolean = target.value;

    if (target.type === 'checkbox') {
      value = target.checked;
    }

    const name = target.name;

    if (target.type === 'radio') {
      value = target.value === RADIO_VALUE_YES;
      if (name === PREFERENCES_NAME_BOOLEAN_CEILINGS) {
        setShowCeilingFields(value);
      } else if (name === PREFERENCES_NAME_BOOLEAN_TRIM) {
        setShowTrimFields(value);
      }
    }
    handleValueChange(name, value.toString());
  };

  const handleLaborAndMaterialsChange = (
    value: boolean
  ) => {
    setLaborAndMaterial(value);
    setShowCeilingFields(
      defaultPreferences.ceilings ?? isShowCeilingFields
    );
    setShowTrimFields(
      defaultPreferences.trim ?? isShowTrimFields
    );
  };

  const isTrimAndDoorsPainted =
    defaultPreferences[PREFERENCES_NAME_BOOLEAN_TRIM] ??
    false;
  const isCeilingsPainted =
    defaultPreferences[PREFERENCES_NAME_BOOLEAN_CEILINGS] ??
    false;

  return {
    isPopup,
    isCeilingsPainted,
    isLoading,
    isTrimAndDoorsPainted,
    onValueChange: handleValueChange,
    onLaborAndMaterialsChange:
      handleLaborAndMaterialsChange,
    onChange: handleChange,
    onPreferenceSubmit: handlePreferenceSubmit,
    specialRequests,
    dispatchSpecialRequests: setSpecialRequests,
    isMoveFurniture: Boolean(isMoveFurniture),
    dispatchShowCeilingFields: setShowCeilingFields,
    dispatchShowTrimFields: setShowTrimFields,
    dispatchMoveFurniture: setMoveFurniture,
    dispatchPreferences:setPreferences,
    isLaborAndMaterials: isLaborAndMaterials === true,
    isShowCeilingFields,
    isShowTrimFields,
    ...defaultPreferences,
  };
};
