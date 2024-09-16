import React, {
  useState,
  useEffect,
  FormEvent,
  ChangeEvent,
  MouseEventHandler,
} from 'react';
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import firebase from '../../../lib/firebase';
import Link from 'next/link';
import {
  getFirestore,
  query,
  collection,
  where,
  addDoc,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { ButtonsCvaButton } from '@/components/cva/button';
import { createPortal } from 'react-dom';
import { Modal } from '@/components/modal';
import { TTapEvent } from '@/types/dom';
import { THeaderOptionsProps } from '@/components/shell/header/options';
import { FallbacksLoading } from '@/components/fallbacks/loading';

type SignInButtonProps = THeaderOptionsProps & {
  className?: string;
};
const SignInButton: React.FC<SignInButtonProps> = ({
  className,
  ...props
}) => {
  const [showModal, setShowModal] = useState(false);
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
      setIsSignedIn(!!user); // Set true if user exists, false otherwise
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
    e: ChangeEvent<HTMLInputElement>
  ) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    setPassword(e.target.value);
  };

  if (authLoading) {
    return <FallbacksLoading />; // Or any other loading indicator
  }
  const title = isSignedIn ? 'Sign Out' : 'Login';
  const handleClick = (e: TTapEvent) => {
    if (isSignedIn) {
      handleSignOut();
      return;
    } else {
      setShowModal(true);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    if (props.onClose) {
      props.onClose();
    }
  };

  return (
    <>
      <ButtonsCvaButton
        onTap={handleClick}
        className={`${className || ''}`}
        title={title}
        intent="ghost"
        layout={false}
        size="sm"
      >
        {title}
      </ButtonsCvaButton>
      {showModal && (
        <>
          {createPortal(
            <Modal onTap={handleClose}>
              <div className="modal-overlay">
                <div className="modal-content secondary-color">
                  <button
                    onClick={handleClose}
                    className="close-modal"
                  >
                    X
                  </button>
                  <form
                    onSubmit={handleSignIn}
                    className="flex flex-col space-y-4"
                  >
                    <input
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      placeholder="Email"
                      className="p-2 border rounded w-full"
                    />
                    <input
                      type="password"
                      value={password}
                      onChange={handlePasswordChange}
                      placeholder="Password"
                      className="p-2 border rounded w-full"
                    />
                    {errorMessage && (
                      <p className="text-red-600">
                        {errorMessage}
                      </p>
                    )}{' '}
                    {/* Display error message */}
                    <button
                      type="submit"
                      className={`text-sm sm:text-bas button-green ${
                        isLoading
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                      disabled={isLoading}
                    >
                      {isLoading
                        ? 'Logging In...'
                        : 'Log in'}
                    </button>
                    <Link
                      className="text-center text-blue-600 underline"
                      onClick={handleClose}
                      href="/signup"
                    >
                      Sign Up
                    </Link>
                  </form>
                </div>
              </div>
            </Modal>,
            document.body
          )}
        </>
      )}
    </>
  );
};

export default SignInButton;
