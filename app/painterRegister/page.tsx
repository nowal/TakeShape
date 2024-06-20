'use client';

// PainterRegisterPage.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getFirestore, doc, setDoc, collection } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import firebase from '../../lib/firebase';
import { useAtom } from 'jotai';
import { painterInfoAtom } from '../../atom/atom';
import { isPainterAtom } from '../../atom/atom'; // Adjust the import path as needed

export default function PainterRegisterPage() {
  const [businessName, setBusinessName] = useState('');
  const [zipCodes, setZipCodes] = useState('');
  const [isInsured, setIsInsured] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPainter, setIsPainter] = useAtom(isPainterAtom);
  const [painterInfo, setPainterInfo] = useAtom(painterInfoAtom);
  const storage = getStorage(firebase);
  const router = useRouter();
  const auth = getAuth(firebase);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true); // Set loading state to true
    setErrorMessage(''); // Reset error message

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const logoUrl = logo ? await uploadLogoAndGetUrl(logo) : ''; // Handle logo upload if provided
      const zipCodesArray = zipCodes.split(',').map(zip => zip.trim());
      const acceptedQuotes = [''];

      const painterData = {
        businessName,
        zipCodes: zipCodesArray,
        isInsured,
        logoUrl,
        acceptedQuotes,
        phoneNumber,
        userId: user.uid, // Link the painter data to the user ID
      };

      const firestore = getFirestore();
      const painterDocRef = doc(collection(firestore, "painters"));

      await setDoc(painterDocRef, painterData);
      console.log('Painter info saved:', painterData);
      setIsPainter(true); // Set the user as a painter

      router.push('/dashboard');
    } catch (error) {
      console.error('Error registering painter: ', error);
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

  const uploadLogoAndGetUrl = async (logoFile: File | null) => {
    if (!logoFile) {
      return ''; // Return an empty string if no logo file is provided
    }

    const storage = getStorage(firebase);
    const logoRef = storageRef(storage, `logos/${logoFile.name}-${Date.now()}`); // Append timestamp to ensure unique file names

    try {
      const uploadResult = await uploadBytes(logoRef, logoFile);
      console.log('Upload result:', uploadResult);

      const logoUrl = await getDownloadURL(uploadResult.ref);
      console.log('Logo URL:', logoUrl);

      return logoUrl;
    } catch (error) {
      console.error('Error uploading logo: ', error);
      throw new Error('Error uploading logo.');
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      const validTypes = ['image/png', 'image/jpeg', 'application/pdf'];
      if (validTypes.includes(file.type)) {
        setLogo(file); // Set the selected file to the 'logo' state
      } else {
        alert('Invalid file type. Please select a PNG, JPG, or PDF file.');
        e.target.value = ''; // Reset the file input
      }
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-center text-2xl font-bold mb-6">Painter Registration</h1>

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <div>
          <label htmlFor="businessName" className="block text-md font-medium text-gray-700">Business or Personal Name</label>
          <input
            type="text"
            id="businessName"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Enter your business or personal name"
            required
            className="p-2 border rounded w-full"
          />
        </div>

        <div>
          <label htmlFor="zipCodes" className="block text-md font-medium text-gray-700">Zip Codes</label>
          <input
            type="text"
            id="zipCodes"
            value={zipCodes}
            onChange={(e) => setZipCodes(e.target.value)}
            placeholder="Enter zip codes separated by commas"
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

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isInsured"
            checked={isInsured}
            onChange={(e) => setIsInsured(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="isInsured" className="text-md font-medium text-gray-700">Are you insured?</label>
        </div>

        <div>
          <label htmlFor="logo" className="block text-md font-medium text-gray-700">Company Logo (optional)</label>
          <input
            type="file"
            id="logo"
            onChange={handleLogoChange}
            accept="image/png, image/jpeg, application/pdf" // Restrict file types
            className="p-2 border rounded w-full"
          />
        </div>

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

        <button 
          type="submit" 
          className={`button-color hover:bg-green-900 text-white font-bold py-2 px-4 rounded ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
}
