'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, query, where, getDocs, deleteDoc, getDoc, doc, setDoc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { useAtom } from 'jotai';
import { isPainterAtom, painterInfoAtom, documentIdAtom } from '../../atom/atom';
import SignInButton from '@/components/signInButton';

export default function SignupAccountPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPainter, setIsPainter] = useAtom(isPainterAtom);
  const [docId, setDocId] = useAtom(documentIdAtom);
  const [painterInfo] = useAtom(painterInfoAtom); // Access the painterInfo atom
  const [showLoginInstead, setShowLoginInstead] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const auth = getAuth();
    const firestore = getFirestore();
  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Link the quote data to the user's account
      const quoteData = sessionStorage.getItem('quoteData');
      
      console.log('Doc ID?:' + docId);
      if (quoteData && user && docId) {
        const quote = JSON.parse(quoteData);

        // Get the document reference for the specific document ID
        const userImageDocRef = doc(firestore, "userImages", docId);
  

        // Retrieve the document
        const userImageSnap = await getDoc(userImageDocRef);

        if (userImageSnap.exists()) {
          // Update the document with the new user's ID
          await updateDoc(userImageDocRef, {
            userId: user.uid,
            ...quote // spread the quote data if needed
          });

          sessionStorage.removeItem('quoteData'); // Clean up session storage
          sessionStorage.removeItem('documentId'); // Also clean up the documentId from session storage
        } else {
          console.error("No user image document found with the provided documentId");
          // Handle the error - no document found with the provided ID
        }
      }
  
      // Handle painter data if necessary
      if (isPainter && sessionStorage.getItem('painterId')) {
        const oldPainterId = sessionStorage.getItem('painterId');
        await handlePainterData(oldPainterId, user.uid);
      } else {
        setIsPainter(false);
      }
  
      router.push('/dashboard');
    } catch (error) {
      console.error("Error signing up: ", error);
      alert("Error during sign up. Please try again.");
    }
  };

  const handlePainterData = async (oldPainterId: string | null, newUserId: string) => {
    const firestore = getFirestore();
    if (oldPainterId) {
      // Fetch the old painter document
      const oldPainterDocRef = doc(firestore, "painters", oldPainterId);
      const oldPainterSnap = await getDoc(oldPainterDocRef);

      if (oldPainterSnap.exists()) {
        const oldPainterData = oldPainterSnap.data();

        // Create a new painter document with the newUserId as the document ID and update userId field
        const newPainterDocRef = doc(firestore, "painters", newUserId);
        await setDoc(newPainterDocRef, {
          ...oldPainterData,
          userId: newUserId, // Set the userId field to match the new user's Firebase Auth ID
        });

        await deleteDoc(oldPainterDocRef);

        console.log('Painter profile linked with new user ID:', newUserId);
        setIsPainter(true);
        sessionStorage.removeItem('painterId'); // Clean up session storage
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

        <button type="submit" className="button-color hover:bg-green-900 text-white font-bold py-2 px-4 rounded">
          Sign Up
        </button>
        {/* Add a link or button for existing users to log in */}
        <p className="text-center">
          Already have an account? <button className="text-blue-600 underline" onClick={() => setShowLoginInstead(true)}>Sign in here</button>
        </p>
      </form>
    </div>
  );
}