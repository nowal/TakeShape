'use client';
import { getAuth } from 'firebase/auth';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { GoogleAnalytics } from '@next/third-parties/google';
import { InputsFile } from '@/components/inputs/file';
import { PicOutline } from '@/components/account-settings/user/pic-outline';
import { IconsUpload } from '@/components/icons/upload';
import { FallbacksLoadingCircle } from '@/components/fallbacks/loading/circle';
import { notifyError } from '@/utils/notifications';
import { errorUpdating } from '@/utils/error';

const AgentAccount = () => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] =
    useState<string | null>(null);
  const [newProfilePicture, setNewProfilePicture] =
    useState<File | null>(null);
  const [
    newProfilePicturePreview,
    setNewProfilePicturePreview,
  ] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const auth = getAuth();
  const firestore = getFirestore();
  const storage = getStorage();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      async (user) => {
        if (user) {
          try {
            const agentDocRef = doc(
              firestore,
              'reAgents',
              user.uid
            );
            const agentDoc = await getDoc(agentDocRef);

            if (agentDoc.exists()) {
              const agentData = agentDoc.data();
              setName(agentData.name || '');
              setPhoneNumber(agentData.phoneNumber || '');
              setProfilePictureUrl(
                agentData.profilePictureUrl || null
              );
            }
          } catch (error) {
            const errorMessage =
              'Failed to load agent data. Please try again later.';
            console.error(
              'Error fetching agent data:',
              error
            );
            setErrorMessage(errorMessage);
            notifyError(errorMessage);
          } finally {
            setIsLoading(false); // Stop loading
          }
        } else {
          setIsLoading(false); // Stop loading if no user is authenticated
        }
      }
    );

    return () => unsubscribe();
  }, [auth, firestore]);

  const handleProfilePictureChange = (file: File) => {
    setNewProfilePicture(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewProfilePicturePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setIsLoading(true); // Set loading state to true
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      let profilePictureUrlToUpdate = profilePictureUrl;

      // Upload new profile picture if provided
      if (newProfilePicture) {
        const profilePictureRef = ref(
          storage,
          `profilePictures/${currentUser.uid}`
        );
        await uploadBytes(
          profilePictureRef,
          newProfilePicture
        );
        profilePictureUrlToUpdate = await getDownloadURL(
          profilePictureRef
        );
      }

      // Update user document in "reAgents" collection
      const userDocRef = doc(
        firestore,
        'reAgents',
        currentUser.uid
      );
      await updateDoc(userDocRef, {
        name,
        phoneNumber,
        profilePictureUrl: profilePictureUrlToUpdate,
      });

      router.push('/agentDashboard');
    } catch (error) {
      const errorMessage =
        'An unexpected error occurred. Please try again.';
      const errorMessage2 = errorUpdating('agent info');
      console.error(errorMessage2, error);
      setErrorMessage(errorMessage);
      notifyError(errorMessage);
      notifyError(errorMessage2);
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  const src = newProfilePicturePreview || profilePictureUrl;

  return (
    <div className="p-8">
      <GoogleAnalytics gaId="G-47EYLN83WE" />

      {errorMessage && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">
            {errorMessage}
          </span>
        </div>
      )}

      {isLoading ? (
        <FallbacksLoadingCircle />
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col space-y-4"
        >
          <div>
            <label
              htmlFor="name"
              className="block text-md font-medium text-gray-700"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              className="p-2 border rounded w-full"
            />
          </div>

          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-md font-medium text-gray-700"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) =>
                setPhoneNumber(e.target.value)
              }
              placeholder="Enter your phone number"
              required
              className="p-2 border rounded w-full"
            />
          </div>

          <div className="relative h-[96px]">
            {/* <label
              htmlFor="profilePicture"
              className="block text-md font-medium text-gray-700"
            >
              Profile Picture
            </label>
            {src && (
              <Image
                src={src}
                alt="Profile Picture"
                className="mb-2 w-24 h-24 object-cover rounded-full"
              />
            )}
            <input
              type="file"
              id="profilePicture"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="p-2 border rounded w-full"
            /> */}

            <InputsFile
              title="Profile Picture"
              onFile={handleProfilePictureChange}
              inputProps={{
                accept: 'image/*',
              }}
              classValue="px-4 gap-6"
              isValue={Boolean(src)}
              icon={{
                Leading: src
                  ? () => (
                      <PicOutline>
                        <Image
                          src={src}
                          alt="Profile Picture"
                          className="mb-2 w-24 h-24 object-cover rounded-full"
                          width="96"
                          height="96"
                          // className="mb-2 w-24 h-24 object-cover rounded-full"
                        />
                      </PicOutline>
                    )
                  : IconsUpload,
              }}
            />
          </div>

          <button
            type="submit"
            className={`button-green ${
              isLoading
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update'}
          </button>
        </form>
      )}
    </div>
  );
};

export default AgentAccount;
