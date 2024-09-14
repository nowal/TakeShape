'use client';

import React, {
  useEffect,
  useState,
  Suspense,
} from 'react';
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
import { GoogleAnalytics } from '@next/third-parties/google';
import { FallbacksLoading } from '@/components/fallbacks/loading';
import { NotificationsHighlight } from '@/components/notifications/highlight';
import { cx } from 'class-variance-authority';
import { InputsCheckbox } from '@/components/inputs/checkbox';
import { ButtonsCvaInput } from '@/components/cva/input';
import { IconsLaborAndMaterials } from '@/components/icons/labor-and-materials';
import { IconsLabor } from '@/components/icons/labor';
import { InputsRadioYesNo } from '@/components/inputs/radio/yes-no';
import { LaborAndMaterials } from '@/app/defaultPreferences/_labor-and-materials';
import { CeilingFieldsLaborAndMaterials } from '@/app/defaultPreferences/_ceiling-fields-with-labor-and-materials';
import { ShowFieldsLaborAndMaterials } from '@/app/defaultPreferences/_show-fields-with-labor-and-materials';
import { DefaultPreferencesFooter } from '@/app/defaultPreferences/_footer';
import { DefaultPreferencesEnd } from '@/app/defaultPreferences/_end';

const DefaultPreferences: React.FC = () => {
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
  const [showPopup, setShowPopup] = useState(false);

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

  return (
    <div className="defaultPreferences flex flex-col justify-start items-center h-screen mb-32">
      <GoogleAnalytics gaId="G-47EYLN83WE" />
      <div className="flex flex-col items-center">
        <h2 className="typography-page-title-preferences">
          We want to make sure your quote is accurate.
        </h2>
        <NotificationsHighlight classValue="mt-2">
          None of your information will be shared with
          painters until you accept a quote. Rest assured,
          your privacy is our priority.
        </NotificationsHighlight>
        {showPopup && (
          <div className="popup-message bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Warning: </strong>
            <span className="block sm:inline">
              If you modify your paint preferences, then any
              existing quotes will no longer be available.
            </span>
          </div>
        )}
        <div
          className={cx(
            'fill-column-white',
            'gap-2',
            'mt-4'
          )}
        >
          <h4 className="typography-form-title">
            What type of service would you like quoted?
          </h4>
          <ul className="flex gap-4">
            <div className="grow relative bg-red">
              <ButtonsCvaInput
                icon={{ Leading: IconsLabor }}
                classValue="border border-transparent has-[:checked]:border-pink has-[:checked]:bg-indigo-50"
                size="fill"
                inputProps={{
                  name: 'labor',
                  value: 'labor',
                  type: 'radio',
                  checked: !isLaborAndMaterials,
                  onChange: () =>
                    handleLaborMaterialChange(false),
                }}
              >
                Labor
              </ButtonsCvaInput>
            </div>
            <div>OR</div>
            <div className="grow w-full relative">
              <ButtonsCvaInput
                icon={{ Leading: IconsLaborAndMaterials }}
                classValue="border border-transparent has-[:checked]:border-pink has-[:checked]:bg-indigo-50"
                size="fill"
                inputProps={{
                  name: 'labor-and-materials',
                  value: 'labor-and-materials',
                  type: 'radio',
                  checked: isLaborAndMaterials,
                  onChange: () =>
                    handleLaborMaterialChange(true),
                  // className: 'form-checkbox',
                }}
              >
                Labor and Material
              </ButtonsCvaInput>
            </div>
          </ul>
          <h4 className="typography-form-subtitle">
            Do you need additional help?
          </h4>
          <ul className="flex flex-col gap-2.5 w-full">
            {(
              [
                [
                  isCeilingsPainted,
                  'Do you want your ceilings painted?',
                ],
                [
                  isTrimAndDoorsPainted,
                  'Do you want your trim and doors painted?',
                ],
                [
                  isMoveFurniture,
                  'Will the painters need to move any furniture?',
                ],
              ] as const
            ).map(([isChecked, text]) => (
              <li
                className="relative fill-row-gray w-full"
                key={text}
              >
                <span>{text}</span>
                <InputsRadioYesNo
                  yesProps={{
                    inputProps: {
                      type: 'radio',
                      checked: isChecked,
                    },
                  }}
                  noProps={{
                    inputProps: {
                      type: 'radio',
                      checked: !isChecked,
                    },
                  }}
                />
              </li>
            ))}
          </ul>
          <label className="flex flex-col items-center gap-2 w-full">
            <h4 className="typography-form-subtitle">
              Special Request
            </h4>
            <textarea
              name="specialRequests"
              placeholder="E.g. Don't paint ceilings in bedrooms, don't remove nails in the wall"
              value={specialRequests}
              onChange={(e) =>
                setSpecialRequests(e.target.value)
              }
              rows={3}
              className="rounded-lg border border-white-3 bg-white-2 w-full px-4.5 py-3.5 outline-none"
            />
          </label>
        </div>
        <DefaultPreferencesFooter
          isLoading={isLoading}
          onPreferenceSubmit={handlePreferenceSubmit}
        />
      </div>
    </div>
  );
};

const DefaultPreferencesWithSuspense: React.FC = () => (
  <Suspense fallback={<FallbacksLoading />}>
    <DefaultPreferences />
  </Suspense>
);

export default DefaultPreferencesWithSuspense;

// {laborAndMaterial && (
//   <LaborAndMaterials
//     onChange={handleChange}
//     color={''}
//     finish={''}
//     paintQuality={''}
//   />
// )}
// <CeilingFieldsLaborAndMaterials
//   isCeilingsPainted={isCeilingsPainted}
//   onChange={handleChange}
//   ceilingColor={''}
//   ceilingFinish={''}
//   isSelected={showCeilingFields && laborAndMaterial}
// />
// <ShowFieldsLaborAndMaterials
//   isTrimAndDoorsPainted={isTrimAndDoorsPainted}
//   trimColor={''}
//   trimFinish={''}
//   onChange={handleChange}
//   isSelected={showTrimFields && laborAndMaterial}
// />
// <DefaultPreferencesEnd />
