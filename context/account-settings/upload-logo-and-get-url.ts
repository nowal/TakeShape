'use client';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import firebase from '@/lib/firebase';

export const useUploadLogoAndGetUrl = () => {
  const handler = async (logoFile: File | null) => {
    if (!logoFile) {
      return ''; // Return an empty string if no logo file is provided
    }
    const storage = getStorage(firebase);

    const logoRef = storageRef(
      storage,
      `logos/${logoFile.name}-${Date.now()}`
    ); // Append timestamp to ensure unique file names

    try {
      const uploadResult = await uploadBytes(
        logoRef,
        logoFile
      );
      console.log('Upload result:', uploadResult);

      const logoUrl = await getDownloadURL(
        uploadResult.ref
      );
      console.log('Logo URL:', logoUrl);

      return logoUrl;
    } catch (error) {
      console.error('Error uploading logo: ', error);
      throw new Error('Error uploading logo.');
    }
  };

  return handler;
};
