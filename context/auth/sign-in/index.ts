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
  signOut,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import firebase from '../../../lib/firebase';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
} from 'firebase/firestore';
import { TAuthConfig } from '@/context/auth/types';

export const useSignIn = ({
  dispatchUserSignedIn,
}: TAuthConfig) => {
  const [isShowModal, setShowModal] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false); // Loading state for login button
  const [errorMessage, setErrorMessage] = useState<
    string | null
  >(null); // Error message state
  const auth = getAuth(firebase);
  const router = useRouter();
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      dispatchUserSignedIn(Boolean(user));
      // setIsSignedIn(!!user); // Set true if user exists, false otherwise
      setAuthLoading(false); // Authentication state is confirmed, loading is done
    });

    const timeoutId = setTimeout(() => {
      setAuthLoading(false); // Forcefully hide loading after a timeout (e.g., 5 seconds)
    }, 2000);

    // Cleanup the listener and timeout on unmount
    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [auth]);

  const handleSignIn = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setIsLoading(true); // Set loading state to true
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
      if (currentUser) {
        const agentDocRef = doc(
          firestore,
          'reAgents',
          currentUser.uid
        );
        const agentDoc = await getDoc(agentDocRef);

        if (agentDoc.exists()) {
          router.push('/agentDashboard');
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
                userId: auth.currentUser.uid,
              }
            );
            sessionStorage.removeItem('quoteData'); // Clean up
          }

          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error signing in:', error);
      setErrorMessage(
        'Incorrect email or password. Please try again.'
      ); // Set error message
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
    sessionStorage.clear();
  };

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
    if (isSignedIn) {
      handleSignOut();
      return;
    } else {
      setShowModal(true);
    }
  };

  const handleClose = () => {
    setShowModal(false);
  };

  return {
    isLoading,
    isShowModal,
    isAuthLoading: authLoading,
    email,
    password,
    errorMessage,
    onEmailChange: handleEmailChange,
    onPasswordChange: handlePasswordChange,
    onClose: handleClose,
    onModalOpen: handleClick,
    onSignIn: handleSignIn,
    dispatchSignInModalOpen: setShowModal,
  };
};
