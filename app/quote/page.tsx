'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { uploadProgressAtom, uploadStatusAtom, videoURLAtom, documentIdAtom } from '@/atom/atom';
import { useAtom } from 'jotai';
import { getFirestore, collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import firebase from '../../lib/firebase';
import UploadButton from '../../components/uploadButton';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsUserLoggedIn(!!user);
    });
    
    return () => {
      unsubscribe(); // Unsubscribe on component unmount
    };
  }, [auth]);

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

  const handleUploadSuccess = (file: File) => {
    setSelectedFile(file);
    setIsUploading(true);
    setCurrentStep(2); // Move to the next step immediately without waiting for the upload to finish

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
  };

  const handlePrevious = async () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Gets here');
      const docRef = await addDoc(collection(firestore, "userImages"), {
        zipCode,
        description,
        paintPreferences,
        providingOwnPaint,
        prices: [],
        video: fileUrl, // Storing single video URL
        userId: auth.currentUser ? auth.currentUser.uid : null,
      });
      console.log('Document written with ID:', docRef.id);
      setDocumentId(docRef.id);
      console.log(documentId);
      
      if (isUserLoggedIn) {
        router.push('/dashboard'); // Route to dashboard if the user is logged in
      } else {
        sessionStorage.setItem('quoteData', JSON.stringify({
          zipCode,
          description,
          paintPreferences,
          providingOwnPaint,
          prices: [],
          video: fileUrl
        }));
        router.push('/signup'); // Route to signup if the user is not logged in
      }
    } catch (error) {
      console.error('Error saving data: ', error);
      alert('Error saving data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 pt-20">
      <div className="border border-gray-300 w-full max-w-xs mx-auto mb-2">
        <div style={{ width: currentStep === 1 ? '50%' : '100%', backgroundColor: '#034E35', height: '10px' }} />
      </div>
      <div className="text-center mb-4">
        Step {currentStep} of 2
      </div>

      {isLoading && currentStep === 2 && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>Uploading video, please wait...</p>
          </div>
        </div>
      )}

      {currentStep === 1 && (
        <div className="image-upload-step mb-14 mt-10 flex justify-center items-center">
          <UploadButton text="Upload Video" onUploadSuccess={handleUploadSuccess} inputId="imageUpload" />
        </div>
      )}

      {currentStep === 1 && (
                <div className="steps-box mb-40 max-w-3xl mx-auto text-left p-4 border rounded shadow-lg secondary-color">
                    <h2 className="text-xl font-bold mb-2 text-center">How to Take Your Video</h2>
                    <ol className="list-decimal pl-4">
                        <li>Use the front camera in landscape video mode.</li>
                        <li>Choose the .5x zoom.</li>
                        <li>Go around the edge of the room as best as possible with camera facing in (it’s ok if you can’t totally keep to the edge due to furniture).</li>
                        <li>In the corners move the phone up and down to capture ceiling and trim.</li>
                        <li>Walk through all areas that you would like painted, taking approximately 30 seconds per room to capture.</li>
                        <li>Specify if you would like to exclude any areas from the quote on the next page.</li>
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
            <label htmlFor="providingOwnPaint" className="block text-md font-medium text-gray-700">Will you be providing your own paint?</label>
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