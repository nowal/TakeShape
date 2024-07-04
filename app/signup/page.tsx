'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, deleteDoc, updateDoc, query, collection, getDocs, where } from 'firebase/firestore';
import { useAtom } from 'jotai';
import { isPainterAtom, painterInfoAtom, documentIdAtom } from '../../atom/atom';
import SignInButton from '@/components/signInButton';
import { GoogleAnalytics } from '@next/third-parties/google';
import { loadGoogleMapsScript } from '../../utils/loadGoogleMapsScript';  // Adjust the import path as needed

function SignupAccountForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPainter, setIsPainter] = useAtom(isPainterAtom);
  const [docId, setDocId] = useAtom(documentIdAtom);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [painterInfo] = useAtom(painterInfoAtom);
  const [showLoginInstead, setShowLoginInstead] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const addressInputRef = useRef<HTMLInputElement>(null);

  const agentId = searchParams.get('agentId'); // Capture the agentId from query parameters

  useEffect(() => {
    const initAutocomplete = async () => {
      try {
        await loadGoogleMapsScript('AIzaSyCtM9oQWFui3v5wWI8A463_AN1QN0ITWAA');  // Replace with your actual API key
        if (window.google) {
          const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current!, {
            types: ['address'],
            componentRestrictions: { country: 'us' }
          });

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (!place.geometry || !place.geometry.location || !place.address_components) {
              console.error('Error: place details are incomplete.');
              return;
            }

            setAddress(place.formatted_address ?? '');  // Add a fallback value
          });
        }
      } catch (error) {
        console.error('Error loading Google Maps script:', error);
      }
    };

    initAutocomplete();
  }, []);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true); // Set loading state to true
    const auth = getAuth();
    const firestore = getFirestore();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user document in "users" collection
      const userDocRef = doc(firestore, "users", user.uid);
      await setDoc(userDocRef, {
        email,
        address,
        name,
        phoneNumber,
        isPainter,
        reAgent: agentId || null // Set the reAgent field if agentId is present
      });

      const quoteData = sessionStorage.getItem('quoteData');
      if (quoteData && user && docId) {
        const quote = JSON.parse(quoteData);
        const userImageDocRef = doc(firestore, "userImages", docId);
        const userImageSnap = await getDoc(userImageDocRef);

        if (userImageSnap.exists()) {
          await updateDoc(userImageDocRef, {
            userId: user.uid,
            ...quote,
            address,
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

      switch (errorCode) {
        case 'auth/email-already-in-use':
          setErrorMessage('The email address is already in use by another account.');
          break;
        case 'auth/weak-password':
          setErrorMessage('The password is too weak.');
          break;
        case 'auth/invalid-email':
          setErrorMessage('The email address is not valid.');
          break;
        case 'auth/operation-not-allowed':
          setErrorMessage('Email/password accounts are not enabled.');
          break;
        case 'auth/network-request-failed':
          setErrorMessage('Network error. Please try again.');
          break;
        default:
          setErrorMessage('An unexpected error occurred. Please try again.');
          break;
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
          <label htmlFor="name" className="block text-md font-medium text-gray-700">Name</label>
          <input 
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
            className="p-2 border rounded w-full"
          />
        </div>

        <div>
          <label htmlFor="phoneNumber" className="block text-md font-medium text-gray-700">Phone Number</label>
          <input 
            type="tel"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter your phone number"
            required
            className="p-2 border rounded w-full"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-md font-medium text-gray-700">Address</label>
          <input
            type="text"
            id="address"
            ref={addressInputRef}
            value={address}
            onChange={handleAddressChange}
            placeholder="Enter your address"
            required
            className="p-2 border rounded w-full"
          />
        </div>

        <button
          type="submit"
          className={`button-color hover:bg-green-900 text-white font-bold py-2 px-4 rounded ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <p>
          Already have an account?{' '}
          <button
            onClick={() => setShowLoginInstead(true)}
            className="text-blue-600 hover:underline"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}

export default function SignupAccountPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupAccountForm />
    </Suspense>
  );
}
