import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import firebase from '../lib/firebase';
import Link from 'next/link';
import { getFirestore, query, collection, where, addDoc, getDocs } from 'firebase/firestore';

type SignInButtonProps = {
  className?: string;
};

const SignInButton: React.FC<SignInButtonProps> = ({ className }) => {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
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

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setShowModal(false);

      // Link quote data to the user's account
      const quoteData = sessionStorage.getItem('quoteData');
      if (quoteData && auth.currentUser) {
        const firestore = getFirestore();
        const quote = JSON.parse(quoteData);
        await addDoc(collection(firestore, "userImages"), {
          ...quote,
          userId: auth.currentUser.uid,
        });
        sessionStorage.removeItem('quoteData'); // Clean up
      }

      router.push('/dashboard');
    } catch (error) {
      console.error('Error signing in:', error);
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

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  if (authLoading) {
    return <div>Loading...</div>; // Or any other loading indicator
  }

  return (
    <div>
      {isSignedIn ? (
        <button onClick={handleSignOut} className={`${className || ''}`}>
          Sign Out
        </button>
      ) : (
        <button onClick={() => setShowModal(true)} className={`${className || ''}`}>
          Sign In
        </button>
      )}


      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content secondary-color">
            <button onClick={() => setShowModal(false)} className="close-modal">X</button>
            <form onSubmit={handleSignIn} className="flex flex-col space-y-4">
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
              <button type="submit" className="text-sm sm:text-bas button-color hover:bg-green-900 text-white font-bold py-2 px-4 rounded">
                Log in
              </button>
              <Link className="text-center text-blue-600 underline" onClick={() => setShowModal(false)} href="/signup">
                Sign Up
                </Link>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          padding: 40px; /* Increased padding for more white space */
          border-radius: 5px;
          position: relative; /* For absolute positioning of close button */
          width: 400px; /* Adjust as needed */
          max-width: 90%;
        }

        .close-modal {
          position: absolute;
          top: 10px;
          right: 10px;
          border: none;
          background: transparent;
          font-size: 18px;
          cursor: pointer;
        }

        .shadow {
            box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
          }
      `}</style>
    </div>
  );
};

export default SignInButton;
