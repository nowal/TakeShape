'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import firebase from '../../lib/firebase';
import { useAtom } from 'jotai';
import { painterInfoAtom, isPainterAtom } from '../../atom/atom'; // Adjust the import path as needed

export default function AccountSettingsPage() {
  const [businessName, setBusinessName] = useState('');
  const [zipCodes, setZipCodes] = useState('');
  const [isInsured, setIsInsured] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPainter, setIsPainter] = useAtom(isPainterAtom);
  const [painterInfo, setPainterInfo] = useAtom(painterInfoAtom);
  const storage = getStorage(firebase);
  const router = useRouter();
  const auth = getAuth(firebase);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const firestore = getFirestore();
        const painterDocRef = doc(firestore, "painters", user.uid);
        const painterDocSnap = await getDoc(painterDocRef);

        if (painterDocSnap.exists()) {
          const painterData = painterDocSnap.data();
          setBusinessName(painterData.businessName || '');
          setZipCodes((painterData.zipCodes || []).join(', '));
          setIsInsured(painterData.isInsured || false);
          setPhoneNumber(painterData.phoneNumber || '');
          setLogoUrl(painterData.logoUrl || '');
        } else {
          setErrorMessage('Painter data not found.');
        }
      } else {
        setErrorMessage('No user found, please log in again.');
      }
      setIsDataLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true); // Set loading state to true
    setErrorMessage(''); // Reset error message

    const user = auth.currentUser;
    if (!user) {
      setErrorMessage('No user found, please log in again.');
      setIsLoading(false);
      return;
    }

    try {
      const firestore = getFirestore();
      const painterDocRef = doc(firestore, "painters", user.uid);

      const updatedLogoUrl = logo ? await uploadLogoAndGetUrl(logo) : logoUrl; // Handle logo upload if provided
      const zipCodesArray = zipCodes.split(',').map(zip => zip.trim());

      const updatedPainterData = {
        businessName,
        zipCodes: zipCodesArray,
        isInsured,
        logoUrl: updatedLogoUrl,
        phoneNumber,
      };

      await updateDoc(painterDocRef, updatedPainterData);
      console.log('Painter info updated:', updatedPainterData);

      window.location.reload(); // Reload the page after updating
    } catch (error) {
      console.error('Error updating painter info: ', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  const uploadLogoAndGetUrl = async (logoFile: File | null) => {
    if (!logoFile) {
      return ''; // Return an empty string if no logo file is provided
    }

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

  if (isDataLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-center text-2xl font-bold mb-6">Account Settings</h1>

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
          {logoUrl && (
            <div className="mt-2">
              <img src={logoUrl} alt="Company Logo" className="h-20" />
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className={`button-color hover:bg-green-900 text-white font-bold py-2 px-4 rounded ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? 'Updating...' : 'Update Information'}
        </button>
      </form>
    </div>
  );
}
