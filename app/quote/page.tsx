'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { uploadProgressAtom, uploadStatusAtom, videoURLAtom, documentIdAtom } from '@/atom/atom';
import { useAtom } from 'jotai';
import { getFirestore, collection, addDoc, updateDoc, arrayUnion, doc, getDoc } from 'firebase/firestore';
import firebase from '../../lib/firebase';
import UploadButton from '../../components/uploadButton';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';

export default function QuotePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [zipCode, setZipCode] = useState('');
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState(''); // New title state
  const [paintPreferences, setPaintPreferences] = useState({
    walls: false,
    ceilings: false,
    trim: false
  });
  const [providingOwnPaint, setProvidingOwnPaint] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false); // State to keep track of user's authentication status
  const [fileUrl, setFileUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // Add errorMessage state
  const auth = getAuth();
  const router = useRouter();
  const firestore = getFirestore(firebase);
  const [, setUploadProgress] = useAtom(uploadProgressAtom);
  const [, setVideoURL] = useAtom(videoURLAtom);
  const [, setUploadStatus] = useAtom(uploadStatusAtom);
  const [, setDocumentId] = useAtom(documentIdAtom);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsUserLoggedIn(!!user);
      if (user) {
        const userDocRef = doc(firestore, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setZipCode(userData.zipCode || ''); // Prepopulate the zip code if it exists
        }
      }
    });
    return () => {
      unsubscribe(); // Unsubscribe on component unmount
    };
  }, [auth, firestore]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaintPreferences({
      ...paintPreferences,
      [e.target.name]: e.target.checked
    });
  };

  const handlePrevious = async () => {
    setCurrentStep(1);
  };

  const handleCreateUserImage = async () => {
    console.log("Creating user image document");
    setIsLoading(true);
    setErrorMessage('');

    try {
        const userImageData = {
            zipCode,
            description,
            paintPreferences,
            providingOwnPaint,
            prices: [],
            video: '', // Initially empty video field
            title, // Add title to userImage
            userId: auth.currentUser ? auth.currentUser.uid : '',
        };

        console.log("User Image Data: ", userImageData);

        // Add the new quote
        const docRef = await addDoc(collection(firestore, "userImages"), userImageData);
        console.log('Document written with ID:', docRef.id);
        setDocumentId(docRef.id);
        sessionStorage.setItem('userImageId', docRef.id); // Store userImageId in sessionStorage

        if (auth.currentUser) {
            const userDocRef = doc(firestore, "users", auth.currentUser.uid);
            await updateDoc(userDocRef, {
                userImages: arrayUnion(docRef.id),
            });
        }

        if (isUserLoggedIn) {
            console.log("Navigating to defaultPreferences with userImageId: ", docRef.id);
            router.push(`/defaultPreferences?userImageId=${docRef.id}`); // Navigate to defaultPreferences with userImageId
        } else {
            // Handle non-logged-in user case
            sessionStorage.setItem('quoteData', JSON.stringify(userImageData));
            router.push(`/signup?userImageId=${docRef.id}`);
        }
    } catch (error) {
        console.error('Error creating user image document: ', error);
        setErrorMessage('Error creating user image document. Please try again.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleUploadSuccess = (file: File) => {
    if (auth.currentUser != null) {
      console.log("Authenticated user UID: ", auth.currentUser.uid);
    } else {
      console.log("No authenticated user");
    }
    setIsUploading(true); // Move to the next step immediately without waiting for the upload to finish

    const storage = getStorage(firebase);
    const fileRef = storageRef(storage, `uploads/${file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file);

    handleCreateUserImage(); // Create the user image document immediately

    // Store the upload promise in the state or a ref
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Handle progress
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
        setUploadStatus('uploading');
        console.log('Upload is ' + progress + '% done');
      },
      (error) => {
        console.error('Error uploading video: ', error);
        setErrorMessage('Error uploading video. Please try again.');
        setIsUploading(false);
      },
      async () => {
        // Handle successful uploads on complete
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        console.log('File available at', url);
        setUploadStatus('completed');
        setFileUrl(url); // Save the URL once the upload is complete
        setVideoURL(url);
        setIsUploading(false);

        // Update the userImage document with the video URL
        const docId = sessionStorage.getItem('userImageId');
        if (docId) {
            await updateDoc(doc(firestore, "userImages", docId), {
              video: url,
            });
            console.log(`Updated userImage document ${docId} with video URL`);
        }
      }
    );
  };

  return (
    <div className="p-8 pt-20">
      <GoogleAnalytics gaId="G-47EYLN83WE" />
  
      {isLoading && currentStep === 2 && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>Uploading, please wait...</p>
          </div>
        </div>
      )}
  
      {currentStep === 1 && (
        <div>
          <div className="title-box flex justify-center items-center">
            <div className="w-1/2">
              <label htmlFor="title" className="block text-md font-medium text-gray-700">Title</label>
              <input 
                type="text" 
                id="title"
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Enter title for your quote" 
                required 
                className="p-2 border rounded w-full"
              />
            </div>
          </div>
          <div className="image-upload-step mb-14 mt-10 flex justify-center items-center">
            <UploadButton text="Submit Video" onUploadSuccess={handleUploadSuccess} inputId="imageUpload" />
          </div>
        </div>
      )}
  
      <div className="steps-box mb-40 max-w-3xl mx-auto text-left p-4 border rounded shadow-lg secondary-color">
        <h2 className="text-xl font-bold mb-2 text-center">How to Take Your Video</h2>
        <ol className="list-decimal pl-4">
          <li>Use the back camera. Hold the phone horizontally. Zoom out as far as possible.</li>
          <li>Go around the edge of the room as best as possible with camera facing the center. Move camera up and down occasionally to capture ceilings and trim.</li>
          <li>Walk through all areas that you would like painted, taking 15-30 seconds for each full room. You can exclude an area in your video from the quote in the next step.</li>
        </ol>
      </div>
  
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
  
        .box-color {
          background-color: #F7E4DE;
        }
  
        .title-box {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          margin: 0 auto;
        }
  
        .modal-content {
          background: white;
          padding: 20px; 
          border-radius: 5px;
          width: 300px; 
          text-align: center;
        }
      `}</style>
    </div>
  );
}  