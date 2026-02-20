import {
  useState,
  useEffect,
  FormEvent,
  ChangeEvent,
} from 'react';
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from 'firebase/auth';
import firebase from '@/lib/firebase';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
} from 'firebase/firestore';
import { TAuthConfig } from '@/context/auth/types';
import { useApp } from '@/context/app/provider';

export const useSignIn = ({
  isUserSignedIn,
  dispatchUserSignedIn,
  dispatchAuthLoading,
  onSignOut,
}: TAuthConfig) => {
  const AUTH_INIT_TIMEOUT_MS = 8000;
  const { onNavigateScrollTopClick } = useApp();
  const [isShowModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignInSubmitting, setSignInSubmitting] =
    useState(false); // Loading state for login button
  const [errorMessage, setErrorMessage] = useState<
    string | null
  >(null); // Error message state
  const auth = getAuth(firebase);

  useEffect(() => {
    let isMounted = true;
    const authInitTimeout = setTimeout(() => {
      if (!isMounted) return;
      console.warn(
        'Auth state initialization timed out. Continuing as signed out.'
      );
      dispatchUserSignedIn(false);
      dispatchAuthLoading(false);
    }, AUTH_INIT_TIMEOUT_MS);

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (!isMounted) return;
        clearTimeout(authInitTimeout);
        const isUser = Boolean(user);
        dispatchUserSignedIn(isUser);
        dispatchAuthLoading(false); // Authentication state is confirmed, loading is done
      },
      (error) => {
        if (!isMounted) return;
        console.error('Error while initializing auth state:', error);
        clearTimeout(authInitTimeout);
        dispatchUserSignedIn(false);
        dispatchAuthLoading(false);
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(authInitTimeout);
      unsubscribe();
    };
  }, [auth, dispatchAuthLoading, dispatchUserSignedIn]);

  const handleSignIn = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setSignInSubmitting(true); // Set loading state to true
    setErrorMessage(null); // Reset error message state
    const firestore = getFirestore(firebase);

    try {
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      setShowModal(false);

      // Check if the signed-in user is in the reAgents collection
      const currentUser = auth.currentUser;
      const isUser = currentUser !== null;

      if (isUser) {
        dispatchUserSignedIn(isUser);
        const agentDocRef = doc(
          firestore,
          'reAgents',
          currentUser.uid
        );
        const agentDoc = await getDoc(agentDocRef);

        if (agentDoc.exists()) {
          onNavigateScrollTopClick('/agentDashboard');
        } else {
          // Link quote data to the user's account if they are not an agent
          const quoteData =
            sessionStorage.getItem('quoteData');
          if (quoteData) {
            const quote = JSON.parse(quoteData);

            await addDoc(
              collection(firestore, 'userImages'),
              {
                ...quote,
                userId: currentUser.uid,
              }
            );
            sessionStorage.removeItem('quoteData'); // Clean up
          }
          console.log(' NAV TO DASHBOARD ');
          onNavigateScrollTopClick('/dashboard');
          dispatchAuthLoading(false); // Authentication state is confirmed, loading is done
        }
      } else {
        console.error('Error current user is null');
      }
    } catch (error) {
      console.error('Error signing in:', error);
      setErrorMessage(
        'Incorrect email or password. Please try again.'
      ); // Set error message
    } finally {
      setSignInSubmitting(false); // Reset loading state
    }
  };

  // const handleSignOut = async () => {
  //   try {
  //     await signOut(auth);
  //     onNavigateScrollTopClick('/');
  //   } catch (error) {
  //     console.error('Error signing out:', error);
  //   } finally {
  //     setProfilePictureUrl(null);
  //   }
  //   sessionStorage.clear();
  // };

  const handleEmailChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setPassword(event.target.value);
  };

  const handleClick = () => {
    if (isUserSignedIn) {
      onSignOut();
      return;
    } else {
      setShowModal(true);
    }
  };

  const handleClose = () => {
    setShowModal(false);
  };

  return {
    isSignInSubmitting,
    isShowModal,
    email,
    password,
    errorMessage,
    onEmailChange: handleEmailChange,
    onPasswordChange: handlePasswordChange,
    onClose: handleClose,
    onSignInButtonClick: handleClick,
    onSignIn: handleSignIn,
    dispatchSignInModalOpen: setShowModal,
  };
};
