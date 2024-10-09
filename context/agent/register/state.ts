import { errorAuth } from '@/utils/error/auth';
import { useState } from 'react';
import {
  getAuth,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth/provider';

export const useAgentRegisterState = () => {
  const { signIn, dispatchUserSignedIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profilePicture, setProfilePicture] =
    useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] =
    useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<
    string | null
  >('');
  const router = useRouter();

  const handleProfilePictureChange = (file: File) => {
    setProfilePicture(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicturePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setSubmitting(true); // Set loading state to true
    const auth = getAuth();
    const firestore = getFirestore();
    const storage = getStorage();

    try {
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
      const user = userCredential.user;

      let profilePictureUrl = '';

      // Upload profile picture if provided
      if (profilePicture) {
        const profilePictureRef = ref(
          storage,
          `profilePictures/${user.uid}`
        );
        await uploadBytes(
          profilePictureRef,
          profilePicture
        );
        profilePictureUrl = await getDownloadURL(
          profilePictureRef
        );
      }

      // Create user document in "reAgents" collection
      const userDocRef = doc(
        firestore,
        'reAgents',
        user.uid
      );
      await setDoc(userDocRef, {
        email,
        name,
        phoneNumber,
        profilePictureUrl,
      });
      dispatchUserSignedIn(true);
      router.push('/agentDashboard');
    } catch (error) {
      console.error('Error signing up: ', error);
      const errorMessage = errorAuth(error);
      setErrorMessage(errorMessage);
    } finally {
      setSubmitting(false); // Reset loading state
    }
  };

  return {
    isSubmitting,
    name,
    email,
    password,
    profilePicturePreview,
    errorMessage,
    phoneNumber,
    dispatchName: setName,
    dispatchPassword: setPassword,
    dispatchEmail: setEmail,
    dipatchPhoneNumber: setPhoneNumber,
    dispatchSubmitting: setSubmitting,
    onProfilePictureChange: handleProfilePictureChange,
    onSubmit: handleSubmit,
  };
};
