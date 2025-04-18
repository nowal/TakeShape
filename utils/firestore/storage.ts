import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import firebaseApp from '@/lib/firebase';

// Initialize Firebase Storage
const storage = getStorage(firebaseApp);

/**
 * Upload a file to Firebase Storage
 * @param file The file to upload (Blob or File)
 * @param path The path in storage where the file should be stored
 * @returns The download URL for the uploaded file
 */
export const uploadFile = async (file: Blob | File, path: string): Promise<string> => {
  try {
    // Create a storage reference
    const storageRef = ref(storage, path);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    console.log(`File uploaded to: ${snapshot.ref.fullPath}`);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log(`Download URL: ${downloadURL}`);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file to Firebase Storage:', error);
    throw error;
  }
};

/**
 * Upload multiple files to Firebase Storage
 * @param files Array of files to upload (Blob or File)
 * @param basePath The base path in storage where files should be stored
 * @returns Array of download URLs for the uploaded files
 */
export const uploadFiles = async (
  files: Array<Blob | File>, 
  basePath: string
): Promise<string[]> => {
  try {
    const uploadPromises = files.map((file, index) => {
      const filename = `image_${Date.now()}_${index}`;
      const path = `${basePath}/${filename}`;
      return uploadFile(file, path);
    });
    
    const downloadURLs = await Promise.all(uploadPromises);
    console.log(`Uploaded ${downloadURLs.length} files to Firebase Storage`);
    
    return downloadURLs;
  } catch (error) {
    console.error('Error uploading files to Firebase Storage:', error);
    throw error;
  }
};

/**
 * Convert a Blob to a data URL
 * @param blob The blob to convert
 * @returns A Promise that resolves to the data URL
 */
export const blobToDataURL = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Fetch an image from a URL and return it as a blob
 * @param url The URL of the image to fetch
 * @returns A Promise that resolves to the image as a blob
 */
export const fetchImageAsBlob = async (url: string): Promise<Blob> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    return await response.blob();
  } catch (error) {
    console.error('Error fetching image as blob:', error);
    throw error;
  }
};
