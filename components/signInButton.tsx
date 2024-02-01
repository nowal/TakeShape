import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import firebase from '../lib/firebase';
import Link from 'next/link';
import { getFirestore, query, collection, where, addDoc, getDocs } from 'firebase/firestore';

const SignInButton = () => {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [justSignedIn, setJustSignedIn] = useState(false);
  const router = useRouter();
  const auth = getAuth(firebase);
  const pathname =usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && justSignedIn) {
        // Check if the user is a painter
        const firestore = getFirestore();
        const q = query(collection(firestore, "painters"), where("userId", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        const isPainter = !querySnapshot.empty; // User is a painter if the query returns documents
  
        sessionStorage.setItem('isPainter', isPainter ? 'true' : 'false');
        
        // Route based on user role
        if (pathname !== '/quote') {
          router.push('/dashboard')
        }
        setJustSignedIn(false); // Reset the flag after redirection
      }
      setIsSignedIn(!!currentUser);
    });
    return unsubscribe;
  }, [auth, pathname, router, justSignedIn]);

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setJustSignedIn(true); // Set flag for just signed in
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

  return (
    <div>
      {auth.currentUser ? (
        <button onClick={handleSignOut} className="shadow bg-green-800 hover:bg-green-900 text-white py-2 px-4 rounded">
          Sign Out
        </button>
      ) : (
        <button onClick={() => setShowModal(true)} className="shadow bg-green-800 hover:bg-green-900 text-white py-2 px-4 rounded">
          Sign In
        </button>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
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
              <button type="submit" className="bg-green-800 hover:bg-green-900 text-white font-bold py-2 px-4 rounded">
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
          background-color: #F7E4DE;
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
