'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getFirestore,
  collection,
  addDoc,
} from 'firebase/firestore';

type TConfig = any;
export const useLandingState = (config?: TConfig) => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [emailForSubscription, setEmailForSubscription] =
    useState('');
  const router = useRouter();
  const firestore = getFirestore();

  useEffect(() => {
    if (imageUrls.length >= 1) {
      // Replace 1 with the number of images you require
      sessionStorage.setItem(
        'uploadedImageUrls',
        JSON.stringify(imageUrls)
      );
      console.log('hello');
      router.push('/signup');
    }
  }, [imageUrls, router]);

  const handleSubscription = async () => {
    if (!emailForSubscription) {
      console.log('Please enter an email address.');
      return; // Early exit if the email input is empty
    }
    try {
      // This will add a new document in the 'subscribedEmails' collection
      // Firestore automatically generates a random document ID for each new document
      await addDoc(
        collection(firestore, 'subscribedEmails'),
        {
          email: emailForSubscription, // Sets the "email" field to the inputted email value
        }
      );
      console.log(
        'Email subscribed successfully:',
        emailForSubscription
      );
      setEmailForSubscription(''); // Clear the input field after subscribing
    } catch (error) {
      console.error('Error subscribing email:', error);
    }
  };

  return {
    emailForSubscription,
    dispatchEmailForSubscription: setEmailForSubscription,
    onSubscription: handleSubscription,
    dispatchImageUrls: setImageUrls,
  };
};
