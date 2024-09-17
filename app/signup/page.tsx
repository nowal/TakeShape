'use client';
import {
  getAuth,
  createUserWithEmailAndPassword,
} from 'firebase/auth';

import {
  ChangeEvent,
  FormEvent,
  Suspense,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  useRouter,
  useSearchParams,
} from 'next/navigation';
import {
  getFirestore,
  doc,
  deleteDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  getDoc,
} from 'firebase/firestore';
import { useAtom } from 'jotai';
import {
  isPainterAtom,
  painterInfoAtom,
  documentIdAtom,
} from '../../atom';
import SignInButton from '@/components/buttons/sign-in-button';
import { GoogleAnalytics } from '@next/third-parties/google';
import { loadGoogleMapsScript } from '../../utils/loadGoogleMapsScript'; // Adjust the import path as needed
import { InputsText } from '@/components/inputs/text';
import { ButtonsCvaButton } from '@/components/cva/button';
import { NotificationsHighlight } from '@/components/notifications/highlight';
import { FallbacksLoading } from '@/components/fallbacks/loading';
import { SignUpLogin } from '@/components/sign-up/login';
import { ALREADY_HAVE_AN_ACCOUNT_TEXT } from '@/components/sign-up/constants';

const SignupAccountForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [addressComponents, setAddressComponents] =
    useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPainter, setIsPainter] = useAtom(isPainterAtom);
  const [docId, setDocId] = useAtom(documentIdAtom);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [painterInfo] = useAtom(painterInfoAtom);
  const [isShowLoginInstead, setShowLoginInstead] =
    useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const addressInputRef = useRef<HTMLInputElement>(null);

  const agentId = searchParams.get('agentId');
  const userImageId = searchParams.get('userImageId');

  console.log(email, password, address, name);

  useEffect(() => {
    console.log('searchParams:', searchParams.toString());
    console.log('agentId:', agentId);
    console.log('userImageId:', userImageId);

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

            setAddress(place.formatted_address ?? ''); // Add a fallback value
            setAddressComponents(
              place.address_components ?? []
            );
            setErrorMessage(''); // Clear the error message when a valid address is selected
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
  }, [agentId, userImageId, searchParams]);

  const handleAddressChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    setAddress(e.target.value);
    setErrorMessage(''); // Clear the error message when the user starts typing
  };

  const validateAddress = () => {
    const requiredComponents = [
      'street_number',
      'route',
      'locality',
      'administrative_area_level_1',
      'postal_code',
    ];
    const foundComponents = requiredComponents.every(
      (component) =>
        addressComponents.some((ac) =>
          ac.types.includes(component)
        )
    );
    return foundComponents;
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setIsLoading(true); // Set loading state to true
    if (!validateAddress()) {
      setErrorMessage('Please enter a valid address.');
      setIsLoading(false);
      return;
    }

    const auth = getAuth();
    const firestore = getFirestore();

    try {
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      const user = userCredential.user;

      // Create user document in "users" collection
      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, {
        email,
        address,
        name,
        phoneNumber,
        isPainter,
        reAgent: agentId || null,
        userImages: userImageId ? [userImageId] : [], // Initialize userImages array with userImageId if present
      });

      // Update the userImage document with the userId
      if (userImageId) {
        const userImageDocRef = doc(
          firestore,
          'userImages',
          userImageId
        );
        await updateDoc(userImageDocRef, {
          userId: user.uid,
        });

        // Add userImageId to the user's userImages array field
        await updateDoc(userDocRef, {
          userImages: arrayUnion(userImageId),
        });
      }

      const quoteData = sessionStorage.getItem('quoteData');
      if (quoteData) {
        const quote = JSON.parse(quoteData);
        if (userImageId) {
          const userImageDocRef = doc(
            firestore,
            'userImages',
            userImageId
          ); // Use userImageId from URL or session
          const userImageSnap = await getDoc(
            userImageDocRef
          );
          if (userImageSnap.exists()) {
            const existingData = userImageSnap.data();
            await updateDoc(userImageDocRef, {
              ...quote,
              address,
              ...(name && { name }),
              ...(phoneNumber && { phoneNumber }),
              userId: user.uid, // Ensure userId is set
              video: existingData.video, // Preserve existing video URL
            });
          }
        }
        sessionStorage.removeItem('quoteData');
      }

      if (
        isPainter &&
        sessionStorage.getItem('painterId')
      ) {
        const oldPainterId =
          sessionStorage.getItem('painterId');
        await handlePainterData(oldPainterId, user.uid);
      } else {
        setIsPainter(false);
      }

      if (userImageId) {
        router.push(
          `/defaultPreferences?userImageId=${userImageId}`
        );
      } else {
        router.push('/quote');
      }
    } catch (error) {
      console.error('Error signing up: ', error);
      const errorCode = (error as { code: string }).code;

      switch (errorCode) {
        case 'auth/email-already-in-use':
          setErrorMessage(
            'The email address is already in use by another account.'
          );
          break;
        case 'auth/weak-password':
          setErrorMessage('The password is too weak.');
          break;
        case 'auth/invalid-email':
          setErrorMessage(
            'The email address is not valid.'
          );
          break;
        case 'auth/operation-not-allowed':
          setErrorMessage(
            'Email/password accounts are not enabled.'
          );
          break;
        case 'auth/network-request-failed':
          setErrorMessage(
            'Network error. Please try again.'
          );
          break;
        default:
          setErrorMessage(
            'An unexpected error occurred. Please try again.'
          );
          break;
      }
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  const handlePainterData = async (
    oldPainterId: string | null,
    newUserId: string
  ) => {
    const firestore = getFirestore();
    if (oldPainterId) {
      const oldPainterDocRef = doc(
        firestore,
        'painters',
        oldPainterId
      );
      const oldPainterSnap = await getDoc(oldPainterDocRef);

      if (oldPainterSnap.exists()) {
        const oldPainterData = oldPainterSnap.data();
        const newPainterDocRef = doc(
          firestore,
          'painters',
          newUserId
        );
        await setDoc(newPainterDocRef, {
          ...oldPainterData,
          userId: newUserId,
        });

        await deleteDoc(oldPainterDocRef);

        setIsPainter(true);
        sessionStorage.removeItem('painterId');
      } else {
        console.error('Old painter document not found');
      }
    }
  };

  if (isShowLoginInstead) {
    return (
      <SignUpLogin
        onTap={() => setShowLoginInstead(false)}
      />
    );
  }

  const submitButtonTitle = isLoading
    ? 'Signing up...'
    : 'Sign Up';

  return (
    <div className="flex flex-col items-stretch gap-6 mt-8">
      <GoogleAnalytics gaId="G-47EYLN83WE" />

      <h2 className="typography-page-title">
        Sign Up for Your Free Quote
      </h2>

      <div className="relative flex flex-col items-center">
        <div className="relative flex flex-col gap-5 items-center w-[320px] sm:w-[382px]">
          {errorMessage && (
            <NotificationsHighlight role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">
                {errorMessage}
              </span>
            </NotificationsHighlight>
          )}
          <div className="rounded-3xl bg-white shadow-08 px-4 py-6 w-full">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-y-4"
            >
              <InputsText
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                required
              />

              <InputsText
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                required
              />

              {/* <InputsText
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) =>
                  setPhoneNumber(e.target.value)
                }
                placeholder="Phone Number"
                required
              /> */}
              <InputsText
                type="text"
                id="address"
                ref={addressInputRef}
                value={address}
                onChange={handleAddressChange}
                placeholder="Address"
                required
              />
              <InputsText
                type="password"
                id="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Password"
                required
              />
              <ButtonsCvaButton
                type="submit"
                isDisabled={isLoading}
                title={submitButtonTitle}
                intent="primary"
                size="md"
                center={true}
              >
                <div className="text-base font-bold">
                  {submitButtonTitle}
                </div>
              </ButtonsCvaButton>
            </form>
            <div className="mt-3.5 text-center">
              <p>
                <span className="text-black-5">
                  {ALREADY_HAVE_AN_ACCOUNT_TEXT}
                </span>
                <ButtonsCvaButton
                  type="submit"
                  isDisabled={isLoading}
                  title={submitButtonTitle}
                  onClick={() => setShowLoginInstead(true)}
                  className="text-blue-600 hover:underline"
                >
                  <div className="text-pink text-base font-bold">
                    Login
                  </div>
                </ButtonsCvaButton>
              </p>
            </div>
          </div>
          <NotificationsHighlight>
            None of your information will be shared with
            painters until you accept a quote. Rest assured,
            your privacy is our priority.
          </NotificationsHighlight>
        </div>
      </div>
    </div>
  );
};

export default function SignupAccountPage() {
  return (
    <Suspense fallback={<FallbacksLoading />}>
      <SignupAccountForm />
    </Suspense>
  );
}
