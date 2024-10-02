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
import firebase from '@/lib/firebase';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
} from 'firebase/firestore';
import { TAuthConfig } from '@/context/auth/types';

export const useSignIn = ({
  isUserSignedIn,
  dispatchUserSignedIn,
  onNavigateScrollTopClick
}: TAuthConfig) => {
  const [isShowModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthLoading, setAuthLoading] = useState(true);
  const [isSigningIn, setSigningIn] = useState(false); // Loading state for login button
  const [errorMessage, setErrorMessage] = useState<
    string | null
  >(null); // Error message state
  const auth = getAuth(firebase);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      dispatchUserSignedIn(Boolean(user));
      setAuthLoading(false); // Authentication state is confirmed, loading is done
    });

    // const timeoutId = setTimeout(() => {
    //   setAuthLoading(false); // Forcefully hide loading after a timeout (e.g., 5 seconds)
    // }, 2000);

    // Cleanup the listener and timeout on unmount
    return () => {
      unsubscribe();
      // clearTimeout(timeoutId);
    };
  }, [auth]);

  const handleSignIn = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setSigningIn(true); // Set loading state to true
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
                userId: auth.currentUser.uid,
              }
            );
            sessionStorage.removeItem('quoteData'); // Clean up
          }

          onNavigateScrollTopClick('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error signing in:', error);
      setErrorMessage(
        'Incorrect email or password. Please try again.'
      ); // Set error message
    } finally {
      setSigningIn(false); // Reset loading state
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onNavigateScrollTopClick('/');
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
    if (isUserSignedIn) {
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
    isSigningIn,
    isShowModal,
    isAuthLoading,
    email,
    password,
    errorMessage,
    onEmailChange: handleEmailChange,
    onPasswordChange: handlePasswordChange,
    onClose: handleClose,
    onSignInButtonClick: handleClick,
    onSignIn: handleSignIn,
    dispatchSignInModalOpen: setShowModal,
    dispatchAuthLoading: setAuthLoading,
  };
};
