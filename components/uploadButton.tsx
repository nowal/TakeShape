// UploadButton.tsx
import React, { ChangeEvent, useState } from 'react';
import firebase from '../lib/firebase';
import { getStorage } from 'firebase/storage';
import { ButtonsCvaInput } from '@/components/cva/input';
import { MarchingAnts } from '@/components/inputs/marching-ants';
import { IconsUpload } from '@/components/icons/upload';

type UploadButtonProps = {
  onUploadSuccess: (file: File) => void;
  inputId: string;
};

export const UploadButton: React.FC<UploadButtonProps> = ({
  onUploadSuccess,
  inputId,
}) => {
  const [isFocus, setFocus] = useState(false);

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

  const handleFileSelection = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      onUploadSuccess(file); // Pass the file to the parent component
    }
  };
  const title = uploading
    ? 'Uploading...'
    : 'Upload your video';

  return (
    <div className="h-[7.25rem]">
      <ButtonsCvaInput
        title={title}
        onClick={() =>
          document.getElementById(inputId)?.click()
        }
        inputProps={{
          type: 'file',
          id: inputId,
          accept: 'video/*',
          onChange: handleFileSelection,
          onMouseEnter: () => {
            setFocus(true);
          },
          onMouseLeave: () => {
            setFocus(false);
          },
          onPointerEnter: () => {
            setFocus(true);
          },
          onPointerLeave: () => {
            setFocus(false);
          },
          onDragEnter: () => {
            setFocus(true);
          },
          onDragOver: () => {
            setFocus(true);
          },
          onDragLeave: () => {
            setFocus(false);
          },
          onDragEnd: () => {
            setFocus(false);
          },
          onDragExit: () => {
            setFocus(false);
          },
          onDrop: () => {
            setFocus(false);
          },
        }}
        style={{ display: 'none' }}
        isDisabled={uploading}
        intent="ghost-1"
        size="fill"
        rounded="lg"
        icon={{ Leading: IconsUpload }}
      >
        {title}
      </ButtonsCvaInput>
      <MarchingAnts isFocus={isFocus} borderRadius="8px" />

      {/* <button 
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
            /> */}
    </div>
  );
};
