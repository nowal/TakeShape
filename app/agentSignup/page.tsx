'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { GoogleAnalytics } from '@next/third-parties/google';

export default function ReAgentSignup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true); // Set loading state to true
    const auth = getAuth();
    const firestore = getFirestore();
    const storage = getStorage();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      let profilePictureUrl = '';

      // Upload profile picture if provided
      if (profilePicture) {
        const profilePictureRef = ref(storage, `profilePictures/${user.uid}`);
        await uploadBytes(profilePictureRef, profilePicture);
        profilePictureUrl = await getDownloadURL(profilePictureRef);
      }

      // Create user document in "reAgents" collection
      const userDocRef = doc(firestore, "reAgents", user.uid);
      await setDoc(userDocRef, {
        email,
        name,
        phoneNumber,
        profilePictureUrl
      });

      router.push('/agentDashboard');
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

  return (
    <div className="p-8">
      <GoogleAnalytics gaId="G-47EYLN83WE" />

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}

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
          <label htmlFor="profilePicture" className="block text-md font-medium text-gray-700">Profile Picture (optional)</label>
          {profilePicturePreview && (
            <img 
              src={profilePicturePreview} 
              alt="Profile Preview" 
              className="mb-2 w-24 h-24 object-cover rounded-full" 
            />
          )}
          <input
            type="file"
            id="profilePicture"
            accept="image/*"
            onChange={handleProfilePictureChange}
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
      </form>
    </div>
  );
}
