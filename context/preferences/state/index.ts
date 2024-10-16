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
  PREFERENCES_NAME_BOOLEAN_MOVE_FURNITURE,
  PREFERENCES_NAME_BOOLEAN_TRIM,
} from '@/atom/constants';
import { RADIO_VALUE_YES } from '@/components/inputs/radio/yes-no/row';
import { TPaintPreferences } from '@/types';
import { resolvePreferencesCurrent } from '@/context/preferences/state/current';
import { notifyError } from '@/utils/notifications';
import { useAuth } from '@/context/auth/provider';
import { useApp } from '@/context/app/provider';
import { usePreferencesStateColor } from '@/context/preferences/state/color';

export const usePreferencesState = () => {
  const { onNavigateScrollTopClick } = useApp();
  const { isUserSignedIn } = useAuth();
  const firestore = getFirestore();
  const auth = getAuth();
  const searchParams = useSearchParams();
  const [defaultPreferences, setPreferences] = useAtom(
    defaultPreferencesAtom
  );
  const [isLaborAndMaterials, setLaborAndMaterial] =
    useState<boolean>(
      PAINT_PREFERENCES_DEFAULTS[
        PREFERENCES_NAME_BOOLEAN_LABOR_AND_MATERIAL
      ]
    );

  const [isShowCeilingFields, setShowCeilingFields] =
    useState(
      defaultPreferences.ceilings ||
        PAINT_PREFERENCES_DEFAULTS[
          PREFERENCES_NAME_BOOLEAN_CEILINGS
        ]
    );

  const [isShowTrimFields, setShowTrimFields] = useState(
    defaultPreferences.trim ||
      PAINT_PREFERENCES_DEFAULTS[
        PREFERENCES_NAME_BOOLEAN_TRIM
      ]
  );

  const [isMoveFurniture, setMoveFurniture] =
    useState<boolean>(
      PAINT_PREFERENCES_DEFAULTS[
        PREFERENCES_NAME_BOOLEAN_MOVE_FURNITURE
      ]
    );
  const [specialRequests, setSpecialRequests] =
    useState<string>('');
  const [isResubmitting, setResubmitting] = useState(false);
  const [isFetchingPreferences, setFetchingPreferences] =
    useState(false);
  const submittingState = useState<boolean>(false);
  const [isSubmitting, setSubmitting] = submittingState;
  const [isPopup, setShowPopup] = useState(false);

  const handleResetPreferences = () => {
    setPreferences(PAINT_PREFERENCES_DEFAULTS);
    setSpecialRequests('');
    setShowTrimFields(
      PAINT_PREFERENCES_DEFAULTS[
        PREFERENCES_NAME_BOOLEAN_TRIM
      ]
    );
    setLaborAndMaterial(
      PAINT_PREFERENCES_DEFAULTS[
        PREFERENCES_NAME_BOOLEAN_LABOR_AND_MATERIAL
      ]
    );
    setMoveFurniture(
      PAINT_PREFERENCES_DEFAULTS[
        PREFERENCES_NAME_BOOLEAN_MOVE_FURNITURE
      ]
    );
    setShowCeilingFields(
      PAINT_PREFERENCES_DEFAULTS[
        PREFERENCES_NAME_BOOLEAN_CEILINGS
      ]
    );
  };

  const preferencesStateColor = usePreferencesStateColor({
    dispatchPreferences: setPreferences,
  });

  useEffect(() => {
    setPreferences({
      ...PAINT_PREFERENCES_DEFAULTS,
      ...defaultPreferences,
    });
  }, []);

  useEffect(() => {
    if (isUserSignedIn && auth.currentUser) {
      fetchUserPreferences();
    }
  }, [isUserSignedIn, auth.currentUser, firestore]);

  const resolveUserImage = () =>
    typeof window !== 'undefined' &&
    (searchParams.get('userImageId') ||
      sessionStorage.getItem('userImageId'));

  const fetchUserPreferences = async (
    nextUserImage?: string
  ) => {
    const userImageId = nextUserImage ?? resolveUserImage();

    console.log('FETCH USER PREFERENCES ');
    if (!auth.currentUser || !userImageId) return;
    if (isResubmitting) {
      setResubmitting(false);
      return;
    }
    setFetchingPreferences(true);

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
    setFetchingPreferences(false);
  };

  const handlePreferenceSubmit = async (
    navigateTo: string,
    morePreferences: boolean
  ) => {
    const userImageId = resolveUserImage();
    if (!auth.currentUser || !userImageId) return;

    try {
      setSubmitting(true); // Set loading state to true

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
            [PREFERENCES_NAME_BOOLEAN_TRIM]:
              isShowTrimFields,
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
      onNavigateScrollTopClick(
        `${navigateTo}?userImageId=${userImageId}`
      );
    } catch (error) {
      const errorMessage =
        'Error submitting preferences. Please try again.';
      notifyError(errorMessage);
      console.error(error);
    } finally {
      setSubmitting(false); // Reset loading state
    }
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

    if (
      target.type === 'radio' ||
      target.type === 'checkbox'
    ) {
      value = value === RADIO_VALUE_YES;
      if (name === PREFERENCES_NAME_BOOLEAN_CEILINGS) {
        setShowCeilingFields(value);
      } else if (name === PREFERENCES_NAME_BOOLEAN_TRIM) {
        setShowTrimFields(value);
      }
      setPreferences((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      handleValueChange(name, value.toString());
    }
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
    isSubmitting,
    isTrimAndDoorsPainted,
    isFetchingPreferences,
    isMoveFurniture: Boolean(isMoveFurniture),
    isResubmitting,
    isLaborAndMaterials: isLaborAndMaterials === true,
    isShowCeilingFields,
    isShowTrimFields,
    specialRequests,
    onResetPreferences: handleResetPreferences,
    onValueChange: handleValueChange,
    onLaborAndMaterialsChange:
      handleLaborAndMaterialsChange,
    onColorChange: handleColorChange,
    onColorValueChange: handleColorValueChange,
    onChange: handleChange,
    onPreferenceSubmit: handlePreferenceSubmit,
    onFetchUserPreferences: fetchUserPreferences,
    dispatchSpecialRequests: setSpecialRequests,
    dispatchShowCeilingFields: setShowCeilingFields,
    dispatchShowTrimFields: setShowTrimFields,
    dispatchMoveFurniture: setMoveFurniture,
    dispatchPreferences: setPreferences,
    dispatchSubmitting: setSubmitting,
    dispatchResubmitting: setResubmitting,
    ...defaultPreferences,
    ...preferencesStateColor,
  };
};
