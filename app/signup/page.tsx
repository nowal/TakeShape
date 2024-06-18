'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, deleteDoc, getDoc, doc, setDoc, updateDoc } from 'firebase/firestore';
import { useAtom } from 'jotai';
import { isPainterAtom, painterInfoAtom, documentIdAtom } from '../../atom/atom';
import SignInButton from '@/components/signInButton';
import { GoogleAnalytics } from '@next/third-parties/google';

export default function SignupAccountPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPainter, setIsPainter] = useAtom(isPainterAtom);
  const [docId, setDocId] = useAtom(documentIdAtom);
  const [name, setName] = useState(''); // Added
  const [phoneNumber, setPhoneNumber] = useState(''); // Added
  const [painterInfo] = useAtom(painterInfoAtom); // Access the painterInfo atom
  const [showLoginInstead, setShowLoginInstead] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true); // Set loading state to true
    const auth = getAuth();
    const firestore = getFirestore();

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const quoteData = sessionStorage.getItem('quoteData');
        if (quoteData && user && docId) {
            const quote = JSON.parse(quoteData);
            const userImageDocRef = doc(firestore, "userImages", docId);
            const userImageSnap = await getDoc(userImageDocRef);

            if (userImageSnap.exists()) {
                await updateDoc(userImageDocRef, {
                    userId: user.uid,
                    ...quote,
                    zipCode: zipcode,
                    ...(name && { name }),
                    ...(phoneNumber && { phoneNumber })
                });

                sessionStorage.removeItem('quoteData');
                sessionStorage.removeItem('documentId');
            } else {
                console.error("No user image document found with the provided documentId");
            }
        }

        if (isPainter && sessionStorage.getItem('painterId')) {
            const oldPainterId = sessionStorage.getItem('painterId');
            await handlePainterData(oldPainterId, user.uid);
        } else {
            setIsPainter(false);
        }

        // Check if the user has submitted a video
        const userImagesQuery = query(collection(firestore, "userImages"), where("userId", "==", user.uid));
        const userImagesSnapshot = await getDocs(userImagesQuery);
        if (!userImagesSnapshot.empty) {
            router.push('/defaultPreferences');
        } else {
            router.push('/quote');
        }
    } catch (error) {
        console.error("Error signing up: ", error);
        const errorCode = (error as { code: string }).code;

        if (errorCode === 'auth/email-already-in-use') {
            setErrorMessage('The email address is already in use by another account.');
        } else if (errorCode === 'auth/weak-password') {
            setErrorMessage('The password is too weak.');
        } else {
            setErrorMessage('An unexpected error occurred. Please try again.');
        }
    } finally {
        setIsLoading(false); // Reset loading state
    }
  };


  const handlePainterData = async (oldPainterId: string | null, newUserId: string) => {
    const firestore = getFirestore();
    if (oldPainterId) {
      const oldPainterDocRef = doc(firestore, "painters", oldPainterId);
      const oldPainterSnap = await getDoc(oldPainterDocRef);

      if (oldPainterSnap.exists()) {
        const oldPainterData = oldPainterSnap.data();
        const newPainterDocRef = doc(firestore, "painters", newUserId);
        await setDoc(newPainterDocRef, {
          ...oldPainterData,
          userId: newUserId,
        });

        await deleteDoc(oldPainterDocRef);

        setIsPainter(true);
        sessionStorage.removeItem('painterId');
      } else {
        console.error("Old painter document not found");
      }
    }
  };

  if (showLoginInstead) {
    return (
      <div className="p-8">
        <h2 className="text-center text-2xl font-bold mb-6">Already have an account?</h2>
        <SignInButton />
        <button onClick={() => setShowLoginInstead(false)} className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <GoogleAnalytics gaId="G-47EYLN83WE" />

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}

      <p className="mb-4">None of this information will be shared with painters until you accept a quote.</p>

      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <div>
          <label htmlFor="email" className="block text-md font-medium text-gray-700">Email Address</label>
          <input 
            type="email" 
            id="email"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="Enter your email" 
            required 
            className="p-2 border rounded w-full"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-md font-medium text-gray-700">Password</label>
          <input 
            type="password" 
            id="password"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Enter your password" 
            required 
            className="p-2 border rounded w-full"
          />
        </div>

        <div>
          <label htmlFor="name" className="block text-md font-medium text-gray-700">Name (Optional)</label>
          <input 
            type="text" 
            id="name"
            value={name} 
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name" 
            className="p-2 border rounded w-full"
          />
        </div>

        <div>
          <label htmlFor="zipcode" className="block text-md font-medium text-gray-700">Property Zipcode</label>
          <input 
            type="text" 
            id="zipcode"
            value={zipcode} 
            onChange={(e) => setZipcode(e.target.value)} 
            placeholder="Enter your zipcode" 
            required 
            className="p-2 border rounded w-full"
          />
        </div>

        <div>
          <label htmlFor="phoneNumber" className="block text-md font-medium text-gray-700">Phone Number (Optional)</label>
          <input 
            type="tel" 
            id="phoneNumber"
            value={phoneNumber} 
            onChange={(e) => setPhoneNumber(e.target.value)} 
            placeholder="Enter your phone number" 
            className="p-2 border rounded w-full"
          />
        </div>

        <button 
          type="submit" 
          className={`button-color hover:bg-green-900 text-white font-bold py-2 px-4 rounded ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? 'Signing Up...' : 'Sign Up'}
        </button>
        <p className="text-center">
          Already have an account? <button className="text-blue-600 underline" onClick={() => setShowLoginInstead(true)}>Sign in here</button>
        </p>
      </form>
    </div>
  );
}
