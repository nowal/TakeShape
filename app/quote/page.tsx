'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  uploadProgressAtom,
  uploadStatusAtom,
  videoURLAtom,
  documentIdAtom,
} from '@/atom/atom';
import { useAtom } from 'jotai';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  arrayUnion,
  doc,
  getDoc,
} from 'firebase/firestore';
import firebase from '../../lib/firebase';
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { GoogleAnalytics } from '@next/third-parties/google';
import { UploadButton } from '@/components/buttons/uploadButton';
import { ButtonsCvaButton } from '@/components/cva/button';
import { cx } from 'class-variance-authority';
import { IconsTick } from '@/components/icons/tick';
import { IconsVideo } from '@/components/icons/video';
import { ButtonsQuoteSubmit } from '@/components/buttons/quote/submit';
import { LinesHorizontal } from '@/components/lines/horizontal';

const SEE_VIDEO_TITLE = 'See Video Example';

export default function QuotePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [zipCode, setZipCode] = useState('');
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState(''); // New title state
  const [paintPreferences, setPaintPreferences] = useState({
    walls: false,
    ceilings: false,
    trim: false,
  });
  const [providingOwnPaint, setProvidingOwnPaint] =
    useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] =
    useState(false); // State to keep track of user's authentication status
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
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        setIsUserLoggedIn(!!user);
        if (user) {
          const userDocRef = doc(
            firestore,
            'users',
            user.uid
          );
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setZipCode(userData.zipCode || ''); // Prepopulate the zip code if it exists
          }
        }
      }
    );
    return () => {
      unsubscribe(); // Unsubscribe on component unmount
    };
  }, [auth, firestore]);

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPaintPreferences({
      ...paintPreferences,
      [e.target.name]: e.target.checked,
    });
  };

  const handlePrevious = async () => {
    setCurrentStep(1);
  };

  const handleCreateUserImage = async () => {
    console.log('Creating user image document');
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
        userId: auth.currentUser
          ? auth.currentUser.uid
          : '',
      };

      console.log('User Image Data: ', userImageData);

      // Add the new quote
      const docRef = await addDoc(
        collection(firestore, 'userImages'),
        userImageData
      );
      console.log('Document written with ID:', docRef.id);
      setDocumentId(docRef.id);
      sessionStorage.setItem('userImageId', docRef.id); // Store userImageId in sessionStorage

      if (auth.currentUser) {
        const userDocRef = doc(
          firestore,
          'users',
          auth.currentUser.uid
        );
        await updateDoc(userDocRef, {
          userImages: arrayUnion(docRef.id),
        });
      }

      if (isUserLoggedIn) {
        console.log(
          'Navigating to defaultPreferences with userImageId: ',
          docRef.id
        );
        router.push(
          `/defaultPreferences?userImageId=${docRef.id}`
        ); // Navigate to defaultPreferences with userImageId
      } else {
        // Handle non-logged-in user case
        sessionStorage.setItem(
          'quoteData',
          JSON.stringify(userImageData)
        );
        router.push(`/signup?userImageId=${docRef.id}`);
      }
    } catch (error) {
      console.error(
        'Error creating user image document: ',
        error
      );
      setErrorMessage(
        'Error creating user image document. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSuccess = (file: File) => {
    if (auth.currentUser != null) {
      console.log(
        'Authenticated user UID: ',
        auth.currentUser.uid
      );
    } else {
      console.log('No authenticated user');
    }
    setIsUploading(true); // Move to the next step immediately without waiting for the upload to finish

    const storage = getStorage(firebase);
    const fileRef = storageRef(
      storage,
      `uploads/${file.name}`
    );
    const uploadTask = uploadBytesResumable(fileRef, file);

    handleCreateUserImage(); // Create the user image document immediately

    // Store the upload promise in the state or a ref
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Handle progress
        const progress =
          (snapshot.bytesTransferred /
            snapshot.totalBytes) *
          100;
        setUploadProgress(progress);
        setUploadStatus('uploading');
        console.log('Upload is ' + progress + '% done');
      },
      (error) => {
        console.error('Error uploading video: ', error);
        setErrorMessage(
          'Error uploading video. Please try again.'
        );
        setIsUploading(false);
      },
      async () => {
        // Handle successful uploads on complete
        const url = await getDownloadURL(
          uploadTask.snapshot.ref
        );
        console.log('File available at', url);
        setUploadStatus('completed');
        setFileUrl(url); // Save the URL once the upload is complete
        setVideoURL(url);
        setIsUploading(false);

        // Update the userImage document with the video URL
        const docId = sessionStorage.getItem('userImageId');
        if (docId) {
          await updateDoc(
            doc(firestore, 'userImages', docId),
            {
              video: url,
            }
          );
          console.log(
            `Updated userImage document ${docId} with video URL`
          );
        }
      }
    );
  };

  return (
    <div className="p-8 pt-20">
      <GoogleAnalytics gaId="G-47EYLN83WE" />

      {isLoading && currentStep === 2 && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-10 z-50">
          <div className="bg-white p-6 rounded w-21">
            <p className="text-center">
              Uploading, please wait...
            </p>
          </div>
        </div>
      )}

      {currentStep === 1 && (
        <div className="flex flex-col items-center gap-6 lg:gap-4 xl:gap-0">
          <div className="flex flex-col items-center gap-1">
            <h2 className="typography-quote-title">
              Get an Instant Painting Quote Today
            </h2>
            <h3 className="typography-quote-subtitle">
              Upload a Video, Receive a Quote Within Minutes
            </h3>
          </div>
          <div className="flex flex-col items-center justify-center gap-[31px] mx-auto lg:flex-row">
            <div className="hidden bg-pink w-[21rem] h-0 xl:flex" />
            <div className="flex flex-col items-center gap-[26px]">
              <div
                className={cx(
                  'flex flex-col items-center py-9 px-6 bg-white rounded-2xl',
                  'gap-2.5',
                  'w-[23.875rem]',
                  'shadow-08'
                )}
              >
                <div className="relative w-full">
                  <UploadButton
                    onUploadSuccess={handleUploadSuccess}
                    inputId="imageUpload"
                  />
                </div>
                <label
                  htmlFor="title"
                  className={cx(
                    'w-full',
                    'shadow-08',
                    'border border-gray-2',
                    'rounded-lg'
                  )}
                >
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) =>
                      setTitle(e.target.value)
                    }
                    placeholder="Enter Title  (e.g. Bedroom Walls)"
                    required
                    className={cx(
                      'px-5 py-3',
                      'font-semibold font-base font-open-sans',
                      'w-full',
                      'truncate'
                    )}
                  />
                </label>
                <ButtonsQuoteSubmit
                  title="Submit Video"
                  isDisabled
                />
              </div>
            </div>
            <div className="relative w-[21rem]">
              <div className="absolute w-full left-0 top-0">
                <svg
                  width="327"
                  height="335"
                  viewBox="0 0 327 335"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.6129 16C8.6129 7.16344 15.7763 0 24.6129 0H311C319.837 0 327 7.16344 327 16V319C327 327.837 319.837 335 311 335H24.6129C15.7764 335 8.6129 327.837 8.6129 319V188.304C8.6129 185.153 7.68288 182.073 5.93945 179.449L3.59205 175.916C0.176114 170.775 0.0221229 164.128 3.19633 158.834L6.33516 153.599C7.82563 151.113 8.6129 148.269 8.6129 145.371V16Z"
                    fill="#FFF6F7"
                  />
                </svg>
              </div>
              <div className="relative flex flex-col px-9 py-5.5">
                <h2 className="text-xl text-pink font-bold">
                  How to Take Your Video
                </h2>
                <ul className="flex flex-col gap-3 mt-3.5">
                  {(
                    [
                      'Use the back camera. Hold the phone horizontally. Zoom out as far as possible.',
                      'Go around the edge of the room as best as possible with camera facing the center. Move camera up and down occasionally to capture ceilings and trim.',
                      'Walk through all areas that you would like painted, taking 15-30 seconds for each full room. You can exclude an area in your video from the quote in the next step.',
                      'Exclude unwanted areas in your video during the next step.',
                    ] as const
                  ).map((text, index) => (
                    <li
                      key={`text-${index}`}
                      className="flex flex-row gap-2.5"
                    >
                      <IconsTick />
                      <span className="text-xs font-open-sans leading-[120%]">
                        {text}
                      </span>
                    </li>
                  ))}
                </ul>
                <LinesHorizontal
                  colorClass="border-white-pink-2"
                  classValue="mt-5"
                />
                {/* <hr className="w-full` h-px border-white-pink-2 mt-5" /> */}
                <ButtonsCvaButton
                  title={SEE_VIDEO_TITLE}
                  icon={{ Trailing: IconsVideo }}
                  size="none"
                  isDisabled
                >
                  <span className="typography-quote-see-video">
                    {SEE_VIDEO_TITLE}
                  </span>
                </ButtonsCvaButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
