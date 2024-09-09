

// UploadButton.tsx
import React, { useState } from 'react';
import firebase from '../lib/firebase'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

type UploadButtonProps = {
  text: string;
  onUploadSuccess: (file: File) => void;
  inputId: string;
};

const UploadButton: React.FC<UploadButtonProps> = ({ text, onUploadSuccess, inputId }) => {
    const [uploading, setUploading] = useState(false);
    const storage = getStorage(firebase);
  
    /*const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
  
      setUploading(true);
      const fileRef = storageRef(storage, `uploads/${file.name}`);
  
      try {
        await uploadBytes(fileRef, file);
        console.log('Uploaded to Firebase:', file.name);
        const fileUrl = await getDownloadURL(fileRef);
        onUploadSuccess(fileUrl);
        console.log('Hello3');
        console.log('File URL:', fileUrl);
        // You can now use fileUrl for further actions, e.g., save to state, display the image, etc.
      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
        setUploading(false);
      }
    };*/

    const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
          onUploadSuccess(file); // Pass the file to the parent component
        }
      };
  
    return (
        <div>
            <button 
            className="button-green"
            onClick={() => document.getElementById(inputId)?.click()}
            disabled={uploading}
            >
            {uploading ? 'Uploading...' : text}
            </button>
            <input 
            type="file"
            id={inputId}
            accept="video/*"
            style={{ display: 'none' }}
            onChange={handleFileSelection}
            />
        </div>
    );
  };
  
  export default UploadButton;