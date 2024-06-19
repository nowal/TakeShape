'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { uploadProgressAtom, uploadStatusAtom, videoURLAtom, documentIdAtom } from '@/atom/atom';
import { useAtom } from 'jotai';
import { getFirestore, collection, addDoc, query, where, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';
import firebase from '../../lib/firebase';
import UploadButton from '../../components/uploadButton';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';

export default function QuotePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [zipCode, setZipCode] = useState('');
  const [description, setDescription] = useState('');
  const [paintPreferences, setPaintPreferences] = useState({
    walls: false,
    ceilings: false,
    trim: false
  });
  const [providingOwnPaint, setProvidingOwnPaint] = useState('');
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false); // State to keep track of user's authentication status
  const [fileUrl, setFileUrl] = useState('');
  const [uploadTask, setUploadTask] = useState(null);
  const auth = getAuth();
  const router = useRouter();
  const firestore = getFirestore(firebase);
  const [userData, setUploadProgress] = useAtom(uploadProgressAtom);
  const [isPainter, setVideoURL] = useAtom(videoURLAtom);
  const [checkingAuth, setUploadStatus] = useAtom(uploadStatusAtom);
  const [documentId, setDocumentId] = useAtom(documentIdAtom);
  const [errorMessage, setErrorMessage] = useState('');

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

  const deleteOldQuotes = async (userId: string) => {
    const q = query(collection(firestore, "userImages"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref); // Delete the document
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaintPreferences({
      ...paintPreferences,
      [e.target.name]: e.target.checked
    });
  };

  const handlePrevious = async () => {
    setCurrentStep(1);
  };

  const handleSubmit = async () => {
    console.log("In handle submit");
    setIsLoading(true);
    setErrorMessage('');

    if (auth.currentUser) {
      try {
        // Delete previous quotes before adding a new one
        await deleteOldQuotes(auth.currentUser.uid);

        // Add a new quote after deleting old ones
        const docRef = await addDoc(collection(firestore, "userImages"), {
          zipCode,
          description,
          paintPreferences,
          providingOwnPaint,
          prices: [],
          video: fileUrl, // Storing single video URL
          userId: auth.currentUser.uid,
        });
        console.log('Document written with ID:', docRef.id);
        setDocumentId(docRef.id);
        
        if (isUserLoggedIn) {
          router.push('/defaultPreferences'); // Navigate to dashboard
        } else {
          // Handle non-logged-in user case
          sessionStorage.setItem('quoteData', JSON.stringify({
            zipCode,
            description,
            paintPreferences,
            providingOwnPaint,
            prices: [],
            video: fileUrl
          }));
          router.push('/signup'); // Navigate to signup page
        }
      } catch (error) {
        console.error('Error saving data: ', error);
        alert('Error saving data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        // Add a new quote after deleting old ones
        const docRef = await addDoc(collection(firestore, "userImages"), {
          zipCode,
          description,
          paintPreferences,
          providingOwnPaint,
          prices: [],
          video: fileUrl, // Storing single video URL
          userId: "",
        });
        console.log('Document written with ID:', docRef.id);
        setDocumentId(docRef.id);
        
        if (isUserLoggedIn) {
          router.push('/dashboard'); // Navigate to dashboard
        } else {
          // Handle non-logged-in user case
          sessionStorage.setItem('quoteData', JSON.stringify({
            zipCode,
            description,
            paintPreferences,
            providingOwnPaint,
            prices: [],
            video: fileUrl
          }));
          router.push('/signup'); // Navigate to signup page
        }
      } catch (error) {
        console.error('Error saving data: ', error);
        alert('Error saving data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleUploadSuccess = (file: File) => {
    if (auth.currentUser != null) {
      console.log(auth.currentUser.uid);
    } else {
      console.log("no user");
    }
    setSelectedFile(file);
    setIsUploading(true); // Move to the next step immediately without waiting for the upload to finish

    const storage = getStorage(firebase);
    const fileRef = storageRef(storage, `uploads/${file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file);

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
        alert('Error uploading video. Please try again.');
        setIsUploading(false);
      },
      () => {
        // Handle successful uploads on complete
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          console.log('File available at', url);
          setUploadStatus('completed');
          setFileUrl(url); // Save the URL once the upload is complete
          setVideoURL(url); 
          setIsUploading(false);
        });
      }
    );
    console.log("Before Handle Submit");
    handleSubmit();
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
        <div className="image-upload-step mb-14 mt-10 flex justify-center items-center">
          <UploadButton text="Upload Video" onUploadSuccess={handleUploadSuccess} inputId="imageUpload" />
        </div>
      )}

      {currentStep ===
       1 && (
                <div className="steps-box mb-40 max-w-3xl mx-auto text-left p-4 border rounded shadow-lg secondary-color">
                    <h2 className="text-xl font-bold mb-2 text-center">How to Take Your Video</h2>
                    <ol className="list-decimal pl-4">
                        <li>Use the back camera. Hold the phone horizontally. Use .5x zoom if available.</li>
                        <li>Go around the edge of the room as best as possible with camera facing the center. Move camera up and down occasionally to capture ceilings and trim. </li>
                        <li>Walk through all areas that you would like painted, taking 15-30 seconds for each full room. You can exclude an area in your video from the quote in the next step.</li>
                    </ol>
                </div>
            )}

      

      {currentStep === 2 && (
        <form onSubmit={handleSubmit} className="secondary-color steps-box mt-10 mb-28 max-w-3xl mx-auto text-left p-4 border rounded shadow-lg secondar-color flex flex-col space-y-4">
          <div>
            <label htmlFor="zipcode" className="block text-md font-medium text-gray-700">Zip Code</label>
            <input 
              type="text" 
              id="zipcode"
              value={zipCode} 
              onChange={(e) => setZipCode(e.target.value)} 
              placeholder="Enter your Zip Code" 
              required 
              className="p-2 border rounded w-full"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-md font-medium text-gray-700">Brief Description</label>
            <textarea 
              id="description"
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="i.e. The walls of the rooms and trim, not ceilings and not hallways" 
              required 
              className="p-2 border rounded w-full"
            />
          </div>

          <fieldset>
            <legend className="text-md font-medium text-gray-700">What do you want painted?</legend>
            <div className="flex space-x-3">
              <label>
                <input type="checkbox" name="walls" checked={paintPreferences.walls} onChange={handleCheckboxChange} />
                Walls
              </label>
              <label>
                <input type="checkbox" name="ceilings" checked={paintPreferences.ceilings} onChange={handleCheckboxChange} />
                Ceilings
              </label>
              <label>
                <input type="checkbox" name="trim" checked={paintPreferences.trim} onChange={handleCheckboxChange} />
                Trim
              </label>
            </div>
          </fieldset>

          <div>
            <label htmlFor="providingOwnPaint" className="block text-md font-medium text-gray-700">Will you be providing your own paint? Your painter will take care of this for you if not.</label>
            <select 
              id="providingOwnPaint" 
              value={providingOwnPaint} 
              onChange={(e) => setProvidingOwnPaint(e.target.value)}
              className="p-2 border rounded w-full"
            >
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          <div className="flex justify-between">
            <button onClick={handlePrevious} className="button-color hover:bg-green-900 text-white py-2 px-4 rounded">
              Previous
            </button>
            <button type="submit" className="button-color hover:bg-green-900 text-white py-2 px-4 rounded">
              Submit
            </button>
          </div>
        </form>
      )}

      <style jsx>{`
        /* ... (rest of your styles) */

        /* Styles for the modal */
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