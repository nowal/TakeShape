'use client';

// PainterRegisterPage.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getFirestore, doc, setDoc, collection } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import firebase from '../../lib/firebase';
import { useAtom } from 'jotai';
import { painterInfoAtom } from '../../atom/atom';
import { isPainterAtom } from '../../atom/atom'; // Adjust the import path as needed

export default function PainterRegisterPage() {
  const [businessName, setBusinessName] = useState('');
  const [zipCodes, setZipCodes] = useState('');
  const [isInsured, setIsInsured] = useState(false);
  const [logo, setLogo] = useState<File | null>(null);
  const [isPainter, setIsPainter] = useAtom(isPainterAtom);
  const [painterInfo, setPainterInfo] = useAtom(painterInfoAtom);
  const storage = getStorage(firebase);
  const router = useRouter();

  useEffect(() => {
    const savePainterInfo = async () => {
      if (painterInfo.businessName) { // Check if businessName is not empty, indicating the form was submitted
        const firestore = getFirestore();
        const painterDocRef = doc(collection(firestore, "painters"));
        try {
          await setDoc(painterDocRef, painterInfo);
          console.log('Painter info saved:', painterInfo);
          setIsPainter(true); // Set the user as a painter
          sessionStorage.setItem('painterId', painterDocRef.id); // Save painter's doc ID for later use in Signup page
          router.push('/signup');
        } catch (error) {
          console.error('Error saving painter info: ', error);
        }
      }
    };

    savePainterInfo();
  }, [painterInfo, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // Handle logo upload and get the URL
      const logoUrl = await uploadLogoAndGetUrl(logo); // Implement this function to handle logo upload and return the URL

      const zipCodesArray = zipCodes.split(',').map(zip => zip.trim());

      // Update the painterInfo atom with the new data
      setPainterInfo({
        businessName,
        zipCodes:zipCodesArray,
        isInsured,
        logoUrl // URL of the uploaded logo
      });

      router.push('/signup');
    } catch (error) {
      console.error('Error preparing painter registration: ', error);
      alert('Error preparing registration. Please try again.');
    }
  };

  const uploadLogoAndGetUrl = async (logoFile: File | null) => {
    if (!logoFile) {
      throw new Error('No logo file provided.');
    }
  
    const storage = getStorage(firebase);
    const logoRef = storageRef(storage, `logos/${logoFile.name}-${Date.now()}`); // Append timestamp to ensure unique file names
  
    try {
      // Upload the logo to Firebase Storage
      const uploadResult = await uploadBytes(logoRef, logoFile);
      console.log('Upload result:', uploadResult);
  
      // Get the URL of the uploaded logo
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
        setLogo(file); // Set the selected file to the 'logo' state
    }
};


  return (
    <div className="p-8 bg-floral-white">
      <h1 className="text-center text-2xl font-bold mb-6">Painter Registration</h1>
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
          <label htmlFor="isInsured" className="block text-md font-medium text-gray-700">Are you insured?</label>
          <input 
            type="checkbox" 
            id="isInsured"
            checked={isInsured} 
            onChange={(e) => setIsInsured(e.target.checked)} 
            className="p-2 border rounded w-full"
          />
        </div>

        <div>
          <label htmlFor="logo" className="block text-md font-medium text-gray-700">Company Logo</label>
          <input 
            type="file" 
            id="logo"
            onChange={handleLogoChange} 
            className="p-2 border rounded w-full"
          />
        </div>

        <button type="submit" className="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded">
          Register
        </button>
      </form>
      <style jsx>{`
        /* ... (rest of your styles) ... */
        .bg-floral-white {
          background-color: floralwhite; /* Adjust the color as needed */
        }
      `}</style>
    </div>
  );
}
