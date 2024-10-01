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
import { defaultPreferencesAtom } from '@/atom';
import { TValueChangeHandler } from '@/components/inputs/types';
import {
  PAINT_PREFERENCES_DEFAULTS,
  PREFERENCES_NAME_BOOLEAN_CEILINGS,
  PREFERENCES_NAME_BOOLEAN_LABOR_AND_MATERIAL,
  PREFERENCES_NAME_BOOLEAN_TRIM,
} from '@/atom/constants';
import { RADIO_VALUE_YES } from '@/components/inputs/radio/yes-no/row';
import { usePreferencesStateAddress } from '@/context/preferences/state/address';
import { usePreferencesStateColor } from '@/context/preferences/state/color';
import { TPaintPreferences } from '@/types';
import { resolvePreferencesCurrent } from '@/context/preferences/state/current';
import { useDebounce } from '@/hooks/use-debounce';

export const usePreferencesState = () => {
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
  const [isLoading, setLoading] = loadingState;

  const [isPopup, setShowPopup] = useState(false);

  const userImageId =
    typeof window !== 'undefined' &&
    (searchParams.get('userImageId') ||
      sessionStorage.getItem('userImageId'));

  const preferencesStateAddress =
    usePreferencesStateAddress({
      loadingState,
      firestore,
      userImageId,
      currentUser: auth.currentUser,
    });

  const preferencesStateColor = usePreferencesStateColor({
    dispatchPreferences: setPreferences,
  });
  const handleDebounce = useDebounce();

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
            ...PAINT_PREFERENCES_DEFAULTS,
            laborAndMaterial: isLaborAndMaterials,
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
        ...PAINT_PREFERENCES_DEFAULTS,
        laborAndMaterial: isLaborAndMaterials,
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
    const updatedPreferences: TPaintPreferences =
      resolvePreferencesCurrent({
        defaultPreferences,
        preferencesFlags: {
          [PREFERENCES_NAME_BOOLEAN_CEILINGS]:
            isShowCeilingFields,
          [PREFERENCES_NAME_BOOLEAN_TRIM]: isShowTrimFields,
          [PREFERENCES_NAME_BOOLEAN_LABOR_AND_MATERIAL]:
            isLaborAndMaterials,
        },
      });

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

  const handleColorValueChange = (
    name: string,
    color: string
  ) => {
    handleValueChange(name, color);
  };

  const handleColorChange = (
    event:
      | ChangeEvent<HTMLInputElement>
      | ChangeEvent<HTMLSelectElement>
  ) => {
    const nextName = event.currentTarget.name;
    const nextColor = event.currentTarget.value;
    handleValueChange(nextName, nextColor);
    // handleDebounce(() =>
    //   preferencesStateColor.onColorSearch(
    //     nextName,
    //     nextColor
    //   )
    // );
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
    onColorChange: handleColorChange,
    onColorValueChange: handleColorValueChange,

    onChange: handleChange,
    onPreferenceSubmit: handlePreferenceSubmit,
    specialRequests,
    dispatchSpecialRequests: setSpecialRequests,
    isMoveFurniture: Boolean(isMoveFurniture),
    dispatchShowCeilingFields: setShowCeilingFields,
    dispatchShowTrimFields: setShowTrimFields,
    dispatchMoveFurniture: setMoveFurniture,
    dispatchPreferences: setPreferences,
    isLaborAndMaterials: isLaborAndMaterials === true,
    isShowCeilingFields,
    isShowTrimFields,
    ...defaultPreferences,
    ...preferencesStateAddress,
    ...preferencesStateColor,
  };
};
